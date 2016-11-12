
import WordMatch from './WordMatch'
import WildcardMatch from './WildcardMatch'
import { ExactWordMatch } from './ExactWordMatch'
import PosFormWordMatch from './PosFormWordMatch'
import WordInFormMatch from './WordInFormMatch'
import { POS_NAMES } from './PosFormWordMatch'
import TagWordMatch from './TagWordMatch'
import { QUANTIFIERS } from './AbstractQuantifierMatch'

import Inflections from '../inflection/Inflections'
import { ENGLISH_FORMS_BY_POS, FORMS, Number, GrammaticalCase, InflectionForm } from '../inflection/InflectionForms'
import Facts from '../fact/Facts'

import AnyWord from '../AnyWord'
import Words from '../Words'
import Word from '../Word'
import InflectableWord from '../InflectableWord'
import InflectedWord from '../InflectedWord'
import Corpus from '../Corpus'

import EnglishPatternFragment from './EnglishPatternFragment'
import PhraseMatch from './PhraseMatch'
import Phrase from './Phrase'
import AdverbWordMatch from './AdverbWordMatch'
import CaseStudyMatch from './CaseStudyMatch'
import MatchContext from './MatchContext'
import { Match, WordMatched } from './Match'

import findPotentialArticle from './findPotentialArticle'

export enum CaseStudy {
    STUDY_CASE, STUDY_BOTH
}

export interface JsonFormat {
    pattern: string,
    en: string
}

let counter = 0

function getEnglishInflectionFromList(pos, form, inflectionList) {
    let en: { [ form: string ]: string } = {}
    en[''] = inflectionList[0]

    ENGLISH_FORMS_BY_POS[pos].allForms.map((form, index) => {
        let inflection = inflectionList[index+1]

        if (!inflection) {
            return
        }

        let els = inflection.split(':')

        if (els.length == 2) {
            en[els[0]] = els[1].trim()
        }
        else {
            en[form] = inflectionList[index+1]
        }
    })

    let englishForm = InflectedWord.getEnglishForm(pos, form, en)

    let result = en[englishForm] || en['']

    if (englishForm == 'inf') {
        result = 'to ' + result
    }

    return result
}

class Placeholder {
    placeholder: string
    fragmentIndex: number
    inflections: string[]
    toPosOrForm: string
    article: boolean
}

type WordToString = (word: Word, enSentence: string) => string;
type PhraseToString = (phrase: PhraseMatch, wordMatched: WordMatched, wordToString?: WordToString) => string;

const defaultWordToString: WordToString = (word, enSentence) => {
    let tc = word.getTranslationCount()

    if (tc > 1 && enSentence) {    
        enSentence = enSentence.toLowerCase()

        for (let i = 1; i < tc; i++) {
            let enWord = word.getEnglish('', i) 
            let en = enWord.toLowerCase()

            let matchIndex = enSentence.indexOf(en)

            if (matchIndex >= 0) {
                if (matchIndex > 0 && enSentence[matchIndex-1].match(/\w/)) {
                    continue
                }

                if (matchIndex + enWord.length < enSentence.length && 
                    enSentence[matchIndex + enWord.length].match(/\w/)) {
                    continue
                }

                return en
            }
        }
    }

    return word.getEnglish()
} 

const defaultPhraseToString: PhraseToString = 
    (phrase: PhraseMatch, wordMatched: WordMatched, wordToString?: WordToString) => {
    let childMatch = wordMatched.childMatch

    return childMatch.pattern.getEnglishFragments().map(f => f.en(childMatch, wordToString)).join(' ')
}

function formTransform(pos: string, forms: string[]): WordToString {
    return (word: Word, enSentence) => {
        if (word instanceof InflectedWord && word.pos == pos) {
            let inflection

            forms.find(form => {
                inflection = word.word.inflect(form)

                return !!inflection
            })
            
            if (inflection) {
                return inflection.getEnglish()
            }
            else {
                console.warn(`No form ${forms.join(', ')} of ${word} for transform.`)
            }
        }

        return defaultWordToString(word, enSentence)
    }
}

function simplePresentTransform(): WordToString {
    return (word: Word, enSentence) => {
        if (word instanceof InflectedWord && word.pos == 'v') {
            let inflection = word.word.inflect('inf')
            
            if (inflection) {
                let str = inflection.getEnglish()

                if (str.substr(0, 3) == 'to ') {
                    return str.substr(3)
                }
                else {
                    return str
                }
            }
        }

        return defaultWordToString(word, enSentence)
    }
}

function englishOnlyTransform(pos: string, englishForm: string): WordToString {
    return (word: Word, enSentence) => {
        if (word instanceof InflectedWord && word.pos == pos) {
            return word.word.getEnglish(englishForm)
        }

        return defaultWordToString(word, enSentence)
    }
}

const TRANSFORMS: { [id: string]: WordToString } = {
    'inf': formTransform('v', ['inf']),
    'pres': simplePresentTransform(),
    '1sg': formTransform('v', ['1']),
    'prog': englishOnlyTransform('v', 'prog'),
    'past': englishOnlyTransform('v', 'past'),
    'pastpart': englishOnlyTransform('v', 'pastpart'),
    'sg': formTransform('n', ['nom']),
    'pl': formTransform('n', ['pl']),
    'nom': formTransform('pron', ['nom', 'pl']),
    'acc': formTransform('pron', ['acc']),
    'adj': formTransform('adj', ['m']),
    'adv': formTransform('adj', ['adv'])
}

class Fragment implements EnglishPatternFragment {
    placeholders: Placeholder[]
    squarePlaceholderCount: number = 0

    constructor(public enString: string, previousSquarePlaceholderCount: number, pattern: PhrasePattern) {
        this.enString = enString

        this.placeholders = [];

        (enString.match(/[\[\(](.*?)[\]\)]/g) || []).forEach(placeholder => {
            let params = placeholder.substr(1, placeholder.length-2).split(',')

            if (placeholder[0] == '[') {
                this.squarePlaceholderCount++
            }

            if (!params.length) {
                console.warn(`Empty placeholder in phrase ${enString}.`)
                return
            }

            let article = false

            let arrowEls: string[] = []
            let fragmentIndexString: string
            let fragmentIndex: number
            let inflections: string[]

            if (params[0] == 'article') {
                article = true
            }
            else {
                arrowEls = params[params.length-1].split('->')
                fragmentIndexString = arrowEls[0]
                fragmentIndex = parseInt(fragmentIndexString)
                
                let words: InflectedWord[]
                
                if (isNaN(fragmentIndex)) {
                    if (placeholder[0] == '[') {
                        let caseMatchCount = 0

                        for (let i = 0; i < pattern.wordMatches.length; i++) {
                            if (pattern.wordMatches[i].isCaseStudy()) {
                                caseMatchCount++

                                if (caseMatchCount == this.squarePlaceholderCount) {
                                    fragmentIndex = i + 1
                                    break
                                }
                            }
                        }
                    }
                    else {
                        console.warn(`Missing fragment index in phrase ${enString}.`)
                        return
                    }
                }

                let inflectAsPoS = arrowEls[1]

                if (params.length > 1) {
                    inflections = params.slice(0, params.length-1) 
                }
            }

            this.placeholders.push({
                article: article,
                toPosOrForm: arrowEls[1],
                placeholder: placeholder,
                fragmentIndex: fragmentIndex,
                inflections: inflections
            })
        })
    }

    toString() { 
        return this.en 
    }

    enWithJpForCases(match: Match, beforeCase?: string, afterCase?: string) {
        return this.en(match, null, 
            (phrase: PhraseMatch, wordMatched: WordMatched) => {
                if (wordMatched.wordMatch.isCaseStudy()) {
                    return (beforeCase || '') +
                        wordMatched.childMatch.words.map(w => w.word.jp).join(' ') +
                        (afterCase || '')
                }
                else {
                    return defaultPhraseToString(phrase, wordMatched)
                }
            }
        )        
    }

    getVerbForm(words: Word[]) {
        let form = '2'

        if (words.find(w => w instanceof InflectedWord && w.word.getId() == 'я')) {
            form = '1'
        }
        else if (words.find(w => w instanceof InflectedWord && w.word.getId() == 'ты')) {
            form = '2'
        }
        else if (words.find(w => w instanceof InflectedWord && FORMS[w.form].number == Number.PLURAL)) {
            form = '1pl'
        }
        else {
            form = '3'
        }

        return form
    }

    en(match: Match, wordToString?: WordToString, phraseToString?: PhraseToString): string {
        if (!wordToString) {
            wordToString = defaultWordToString
        }

        if (!phraseToString) {
            phraseToString = defaultPhraseToString
        }

        let result = this.enString

        this.placeholders.forEach(placeholder => {
            if (placeholder.article) {
                return
            }

            let replaceWith: string

            let at = 0
            let wordMatch = match.pattern.wordMatches[placeholder.fragmentIndex-1]

            if (placeholder.inflections) {
                let words = match.words.filter(w => 
                    !!(w.wordMatch == wordMatch && w.word as InflectedWord))
                        .map(w => w.word as InflectedWord)

                if (words.length) {
                    let inflectAsPoS

                    if (placeholder.toPosOrForm) {
                        inflectAsPoS = placeholder.toPosOrForm
                    }
                    else {
                        console.warn(`When agreeing with a case, PoS of forms must be specified in phrase translated as ${result}`)
                        inflectAsPoS = 'v'
                    }

                    let accordWith = words.find(w => w.pos == inflectAsPoS) 
                    let form: string
                    
                    if (!accordWith) {
                        if (inflectAsPoS == 'v') {
                            form = this.getVerbForm(words)
                        }
                        else {
                            accordWith = words[0]

                            console.log(`Could not find any ${inflectAsPoS} in ${ words.map(w=>w.jp).join(' ') }.`)
                        }
                    }

                    replaceWith = getEnglishInflectionFromList(inflectAsPoS, form || accordWith.form, placeholder.inflections)
                }
            }
            else {
                if (placeholder.toPosOrForm) {
                    wordToString = TRANSFORMS[placeholder.toPosOrForm]

                    if (!wordToString) {
                        let matchIndex = parseInt(placeholder.toPosOrForm)

                        if (!isNaN(matchIndex)) {
                            let wordMatch = match.pattern.wordMatches[matchIndex-1]

                            let words = match.words.filter(w => !!(w.wordMatch == wordMatch && w.word as InflectedWord)).map(w => w.word as InflectedWord)

                            let form = this.getVerbForm(words)
                            wordToString = formTransform('v', [ form ])
                        }
                        else {
                            console.warn(`Unknown wordToString ${placeholder.toPosOrForm} in fragment.`)

                            wordToString = defaultWordToString
                        }
                    }
                }

                if (wordMatch instanceof PhraseMatch) {
                    let wordMatched: WordMatched = match.words.find((w) => w.wordMatch == wordMatch)

                    replaceWith = phraseToString(wordMatch, wordMatched, wordToString)
                }
                else {
                    replaceWith = match.words.filter((w) => w.wordMatch == wordMatch)
                        .map(w => wordToString(w.word, match.sentence.english)).join(' ')
                }
            }

            result = result.replace(placeholder.placeholder, replaceWith)
        })

        let replace: { [key: string]: Word[]} = {}		 

        match.words.forEach((m) => {		
            let mStr = m.wordMatch.toString()		

            if (result.indexOf(mStr) >= 0) {		
                let r = replace[mStr]		

                if (!r) {		
                    r = []		
                    replace[mStr] = r		
                }		

                r.push(m.word)		
            }		
        })

        Object.keys(replace).forEach((r) => {		
            result = result.replace(new RegExp(r, 'g'), replace[r].map((w) => 		
                (w instanceof InflectedWord ? w.word.getDefaultInflection().jp : w.jp)		
            ).join(' '))		
        })		

        // there can be multiple article placeholders so we must handle them separately

        if (match.sentence && match.sentence.en()) {
            let atArticle = -1
            
            do {
                const ARTICLE_PLACEHOLDER = '(article)'

                atArticle = result.indexOf(ARTICLE_PLACEHOLDER, atArticle + 1)

                if (atArticle >= 0) {
                    let following = result.substr(atArticle + ARTICLE_PLACEHOLDER.length)
                    let m = following.match(/\w+/)

                    let nextWord = (m && m[0]) || following

                    let article = findPotentialArticle(match.sentence.en(), nextWord) 

                    if (article) {
                        result = result.substr(0, atArticle) + article + following
                    }
                }
            } while (atArticle >= 0)
        }

        result = result.replace(/\(article\)/g, '')
        result = result.replace(/  /g, ' ')

        return result.trim()                           
    }
}

export default class PhrasePattern {
    // it's helpful for React to have a unique ID.
    key = counter++ 
    englishFragmentsCache: Fragment[]

    constructor(public wordMatches: WordMatch[], public en: string) {
        this.wordMatches = wordMatches
        this.en = en
    }

    getDependencies(): Phrase[] {
        return this.wordMatches.map(m => m instanceof PhraseMatch ? m.phrase : null).filter(p => !!p)
    }

    match(context: MatchContext, onlyFirstWord?: boolean): Match {
        let caseStudy = context.study

        if (caseStudy == null) {
            caseStudy = CaseStudy.STUDY_BOTH
        }

        let minWords = this.wordMatches.length

        this.wordMatches.forEach((m) => {
            if (m.allowEmptyMatch()) {
                minWords--
            }
        })

        let words = context.words
        let until = (onlyFirstWord ? 0 : words.length - minWords)

        for (let i = 0; i <= until; i++) {
            let at = i
            let found = true
            let childMatch: Match
            let wordsMatched: WordMatched[] = []

            for (let j = 0; j < this.wordMatches.length; j++) {
                let wordMatch = this.wordMatches[j]

                let m = wordMatch.matches(context, at, this.wordMatches, j)

                if (!m && j > 0 && words[at].pos == 'part') {
                    at++

                    m = wordMatch.matches(context, at, this.wordMatches, j)
                }

                if (!m && !wordMatch.allowEmptyMatch()) {
                    found = false
                    break
                }

                let matchedWordCount: number

                if (typeof m == 'number') {
                    matchedWordCount = m as number
                }
                else {
                    childMatch = m as Match
                    matchedWordCount = childMatch.words.length
                }

                if (!(wordMatch instanceof WildcardMatch) &&
                    (caseStudy == CaseStudy.STUDY_BOTH || 
                     wordMatch.isCaseStudy() == (caseStudy == CaseStudy.STUDY_CASE))) {
                    for (let i = 0; i < matchedWordCount; i++) {
                        wordsMatched.push({
                            index: at+i,
                            word: words[at+i],
                            wordMatch: wordMatch,
                            childMatch: childMatch
                        })
                    }
                }

                at += matchedWordCount
            }

            if (found && wordsMatched.length) {
                return {
                    sentence: context.sentence,
                    words: wordsMatched,
                    pattern: this
                }
            }
        }
    }

    getEnglishFragments(): Fragment[] {
        if (!this.englishFragmentsCache) {
            this.englishFragmentsCache = this.calculateEnglishFragments()
        }

        return this.englishFragmentsCache
    }

    calculateEnglishFragments(): Fragment[] {
        let squarePlaceholderCount = 0

        let result: Fragment[] = []
    
        this.en.split('...').forEach((str) => {
            str = str.trim()

            let fragment = new Fragment(str, squarePlaceholderCount, this)

            squarePlaceholderCount += fragment.squarePlaceholderCount

            result.push(fragment)
        })
    
        return result
    }

    setEnglish(en: string) {
        this.en = en
        this.englishFragmentsCache = null
    }

    setCorpus(corpus: Corpus) {
        this.wordMatches.forEach((m) => m.setCorpus(corpus))
    }

    hasCase(grammaticalCase: GrammaticalCase): boolean {
        return !!this.wordMatches.find((m) => {
            if (m instanceof PhraseMatch) {
                return m.overrideFormCase == grammaticalCase
            }

            return (m as any).form && (m as any).form.grammaticalCase == grammaticalCase
        })
    }

    static parseFormMatch(str: string, line: string): WordMatch {
        let quantifier

        if (QUANTIFIERS[str[str.length - 1]]) {
            quantifier = str[str.length - 1]
            str = str.substr(0, str.length-1)
        }

        let split = str.split('@')

        let formStr = split[1]

        if (formStr == '') {
            formStr = null
        }

        if (formStr && !FORMS[formStr]) {
            throw new Error(`Unknown form "${formStr}" on line "${line}". Should be one of ${ Object.keys(FORMS).join(', ') }.`)
        }

        let posStr = split[0]

        if (posStr == '') {
            posStr = null
        }

        if (posStr && !POS_NAMES[posStr]) {
            throw new Error(`Unknown part of speech "${posStr}" on line "${line}". Should be one of ${ Object.keys(POS_NAMES).join(', ') }.`)
        }

        if (posStr == 'adverb' && !formStr) {
            return new AdverbWordMatch(quantifier)
        }

        return new PosFormWordMatch(posStr, FORMS[formStr], formStr, quantifier)
    }

    getWords(): Set<AnyWord> {
        let result = new Set<AnyWord>()

        let addWord = (word: AnyWord) => {
            if (Words.PUNCTUATION.indexOf(word.toText()) < 0) {
                result.add(word)
            }
        }

        this.wordMatches.forEach((wordMatch) => {
            if (wordMatch instanceof WordInFormMatch) {
                wordMatch.words.forEach(addWord)
            }

            if (wordMatch instanceof ExactWordMatch) {
                wordMatch.words.forEach(addWord)
            }
        })

        return result
    }

    getCases(): Set<GrammaticalCase> {
        let result = new Set<GrammaticalCase>()

        this.wordMatches.forEach((wordMatch) => {
            if (wordMatch.isCaseStudy()) {
                let grammaticalCase = (wordMatch as CaseStudyMatch).getCaseStudied()

                if (grammaticalCase) {
                    result.add(grammaticalCase)
                }
            }
        })

        return result
    }

    static fromString(line: string, en: string, words: Words, inflections: Inflections) {
        let wordMatches: WordMatch[] = []
        
        line.split(' ').forEach((str) => {
            if (!str) {
                return
            }

            let match: WordMatch

            if (str.indexOf('@') == 0 || (str.indexOf('@') > 0 && POS_NAMES[str.substr(0, str.indexOf('@'))])) {
                match = this.parseFormMatch(str, line)
            }
            else if (FORMS[str]) {
                match = new PosFormWordMatch(null, FORMS[str], str, null)
            }
            else if (POS_NAMES[str]) {
                if (str == 'adverb') {
                    match = new AdverbWordMatch()
                }
                else {
                    match = new PosFormWordMatch(str, null, null, null)
                }
            }
            else if (POS_NAMES[str.substr(0, str.length-1)] && QUANTIFIERS[str[str.length-1]]) {
                let posStr = str.substr(0, str.length-1) 
                let quantifier = str[str.length-1]

                if (posStr == 'adverb') {
                    match = new AdverbWordMatch(quantifier)
                }
                else {
                    match = new PosFormWordMatch(posStr, null, null, quantifier)
                }
            }
            else if (str.substr(0, 7) == 'phrase:') {
                str = str.substr(7)

                let hash = str.match(/#([^@]*)/)
                let at = str.match(/@([^#]*)/)

    	        let grammaticalCase: GrammaticalCase
                let tag

                if (at) {
                    let caseStr = at[1]
                    let form = FORMS[caseStr]

                    if (form) {
                        grammaticalCase = form.grammaticalCase
                    }
                    else {
                        console.warn(`Unknown form ${caseStr} in phrase match ${str}.`)
                    }
                }

                if (hash) {
                    tag = hash[1]
                }

                let phraseIdMatch = str.match(/^([^#@]*)/)

                if (!phraseIdMatch || !phraseIdMatch[1]) {
                    throw new Error(`No phrase ID specified in phrase match ${str}.`)
                }

                match = new PhraseMatch(phraseIdMatch[1], grammaticalCase, tag)
            }
            else if (str.substr(0, 4) == 'tag:' || str[0] == '#') {
                str = (str[0] == '#' ? str.substr(1) : str.substr(4))

                let els = str.split('@')

                let tagStr = els[0]

                let form 
                
                if (els[1]) {
                    form = FORMS[els[1]]

                    if (!form) {
                        throw new Error(`"${ els[1] } was not recognized as a form. Valid forms are: ${ Object.keys(FORMS).join(', ') }.`)
                    }
                }

    	        match = new TagWordMatch(tagStr, form)
            }
            else if (str == 'any') {
                match = new WildcardMatch()
            }
            else if (str.indexOf('@') > 0 || str.indexOf('|') >= 0 || words.inflectableWordsById[str] || words.get(str)) {
                let wordStr
                let word: AnyWord
                
                if (str.indexOf('@') < 0) {
                    str += '@'
                }

                if (str[str.length-1] == '@') {
                    wordStr = str.substr(0, str.length-1)
                    
                    let wordList: AnyWord[] = wordStr.split('|').map((w) => {
                        let result: AnyWord = words.inflectableWordsById[w]

                        if (!result) {
                            result = words.get(w)
                        }
                        
                        if (!result) {
                            throw new Error(`Unknown word "${w}". Did you mean ${ words.getSimilarTo(w).join(', ') }?`)
                        }

                        return result
                    })

                    match = new ExactWordMatch(wordList)
                }
                else {
                    wordStr = str

                    word = words.get(wordStr)

                    if (!word) {
                        let wordForm = str.split('@')

                        let wordList: InflectableWord[] = wordForm[0].split('|').map((w) => {
                            let result = words.inflectableWordsById[w]

                            if (!result) {
                                throw new Error(`Word "${w}" (specified in "${str}" in "${line}") is unknown or uninflected. Did you mean ${ words.getSimilarTo(w).join(', ') }?`)
                            }

                            return result
                        })

                        let form = FORMS[wordForm[1]]

                        if (!form) {
                            throw new Error(`Unknown form ${wordForm[1]} of word ${wordForm[0]}. Valid forms are: ${ Object.keys(FORMS).join(', ') }.`)
                        }

                        match = new WordInFormMatch(wordList, form)
                    }
                    else {
                        if (!word) {
                            throw new Error(`Unknown word "${ wordStr }". Did you mean ${ words.getSimilarTo(wordStr).join(', ') }?`)
                        }

                        match = new ExactWordMatch([ word ])
                    }
                }
            }
            else {
                throw new Error(`Unknown word match "${str}". Should either be a form, a part of speech (${ Object.keys(POS_NAMES).join(', ')}), 'any', word@, 'tag:tagName' or 'tag:tagName@case'. Type '@form' to see all forms.`)
            }

            wordMatches.push(match)
        })

        return new PhrasePattern(wordMatches, en)
    }

    toJson(): JsonFormat {
        return {
            pattern: this.toString(),
            en: this.en
        }
    }

    static fromJson(json: JsonFormat, words: Words, inflections: Inflections) {
        return PhrasePattern.fromString(json.pattern, json.en, words, inflections)
    }

    toString() {
        return this.wordMatches.map((wm) => wm.toString()).join(' ')
    }

}