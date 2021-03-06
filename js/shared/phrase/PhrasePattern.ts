import { wordToStudyWord } from '../study/toStudyWords';
import { DebugNode } from '../../frontend/phrase/PhraseDebugger';
import { DebugPosition } from './MatchContext';
import getWordTranslationInSentence from '../getWordTranslationInSentence';
import { untag } from '../../backend/route/tag';
import { inflate } from 'zlib';
import { NamedWordForm } from '../inflection/WordForm';

import WordMatch from './WordMatch'
import WildcardMatch from './WildcardMatch'
import { ExactWordMatch } from './ExactWordMatch'
import PosFormWordMatch from './PosFormWordMatch'
import WordInFormMatch from './WordInFormMatch'
import TagWordMatch from './TagWordMatch'
import { AbstractQuantifierMatch, QUANTIFIERS } from './AbstractQuantifierMatch';
import { MODAL_VERBS } from '../AbstractAnyWord'

import Inflections from '../inflection/Inflections'
import { ENGLISH_FORMS_BY_POS, FORMS, INFLECTION_FORMS } from '../inflection/InflectionForms';
import { GrammarNumber, GrammarCase, PartOfSpeech as PoS } from '../inflection/Dimensions'
import InflectionForm from '../inflection/InflectionForm'
import WordForm from '../inflection/WordForm'
import { POS_BY_NAME } from '../inflection/InflectionForms'
import { WORD_FORMS, DERIVATION_BY_ID } from '../inflection/WordForms'
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

export interface JsonFormat {
    pattern: string,
    en: string
}

let counter = 0

export const POS_BY_LONG_NAME = {
    'verb': PoS.VERB,
    'noun': PoS.NOUN,
    'adjective': PoS.ADJECTIVE,
    'adverb': PoS.ADVERB,
    'pronoun': PoS.PRONOUN,
    'preposition': PoS.PREPOSITION,
    'numeral': PoS.NUMBER,
    'conjunction': PoS.CONJUNCTION,
    'particle': PoS.PARTICLE
}

export let POS_LONG_NAMES: { [pos: number] : string } = {}

for (let name in POS_BY_LONG_NAME) {
    POS_LONG_NAMES[POS_BY_LONG_NAME[name]] = name
}

function getEnglishInflectionFromList(pos: PoS, form, inflectionList) {
    let en: { [ form: string ]: string } = {}
    en[''] = inflectionList[0]

    if (ENGLISH_FORMS_BY_POS[pos]) {
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
    }
    else {
        console.error(`Unhandled PoS ${pos}.`)
    }

    let englishForm = InflectedWord.getEnglishForm(pos, form, en)

    let result = en[englishForm] || en['']

    if (englishForm == 'inf' && !MODAL_VERBS[result]) {
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

type WordToString = (word: Word, enSentence: string, nextWord: AnyWord) => string;
type PhraseToString = (phrase: PhraseMatch, wordMatched: WordMatched, wordToString?: WordToString) => string;

const defaultWordToString: WordToString = (word, enSentence, nextWord) => {
    return getWordTranslationInSentence(word, enSentence, nextWord)
} 

const defaultPhraseToString: PhraseToString = 
    (phrase: PhraseMatch, wordMatched: WordMatched, wordToString?: WordToString) => {
    let childMatch = wordMatched.childMatch

    return childMatch.pattern.getEnglishFragments().map(f => f.en(childMatch, wordToString)).join(' ')
}

function derivationTransform(derivation: string): WordToString {
    return (word: Word, enSentence, nextWord) => {
        let words = word.getDerivedWords(derivation)

        if (words[0]) {
            let derivedWord = words[0]

            if (derivedWord instanceof Word) {
                word = derivedWord
            }
            else if (derivedWord instanceof InflectableWord) {
                word = null

                if (word instanceof InflectedWord) {
                    word = derivedWord.inflect(word.form)
                }

                if (!word) {
                    word = derivedWord.getDefaultInflection()
                }
            }
        }

        return defaultWordToString(word, enSentence, nextWord)
    }    
}

function formTransform(poses: PoS[], forms: string[]): WordToString {
    return (word: Word, enSentence, nextWord) => {
        if (word instanceof InflectedWord && poses.indexOf(word.wordForm.pos) >= 0) {
            let inflected

            forms.find(form => {
                inflected = word.word.inflect(form)

                return !!inflected
            })
            
            if (inflected) {
                return inflected.getEnglish()
            }
            else {
                console.warn(`No form ${forms.join(', ')} of ${word} for transform.`)
            }
        }

        return defaultWordToString(word, enSentence, nextWord)
    }
}

function simplePresentTransform(): WordToString {
    return (word: Word, enSentence, nextWord) => {
        if (word instanceof InflectedWord && word.wordForm.pos == PoS.VERB) {
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

        return defaultWordToString(word, enSentence, nextWord)
    }
}

function englishOnlyTransform(pos: PoS, englishForm: string): WordToString {
    return (word: Word, enSentence, nextWord) => {
        if (word instanceof InflectedWord && word.wordForm.pos == pos) {
            return word.word.getEnglish(englishForm)
        }

        return defaultWordToString(word, enSentence, nextWord)
    }
}

const TRANSFORMS: { [id: string]: WordToString } = {
    'inf': formTransform([ PoS.VERB ], ['inf']),
    'pres': simplePresentTransform(),
    '1sg': formTransform([ PoS.VERB ], ['1']),
    'prog': englishOnlyTransform(PoS.VERB, 'prog'),
    'past': englishOnlyTransform(PoS.VERB, 'past'),
    'pastpart': englishOnlyTransform(PoS.VERB, 'pastpart'),
    'sg': formTransform([ PoS.NOUN, PoS.ADJECTIVE ], ['nom']),
    'pl': formTransform([ PoS.NOUN ], ['pl']),
    'nom': formTransform([ PoS.PRONOUN ], ['nom', 'pl']),
    'acc': formTransform([ PoS.PRONOUN ], ['acc']),
    'super': englishOnlyTransform(PoS.ADJECTIVE, 'super')
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
        return this.enString
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
        else if (words.find(w => w instanceof InflectedWord && FORMS[w.form].number == GrammarNumber.PLURAL)) {
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
                    let inflectAsPoS: PoS

                    if (placeholder.toPosOrForm) {
                        inflectAsPoS = POS_BY_NAME[placeholder.toPosOrForm]

                        if (!inflectAsPoS) {
                            console.error(`Unknown PoS ${placeholder.toPosOrForm} in ${this.toString()}`)
                        } 
                    }
                    else {
                        inflectAsPoS = PoS.VERB
                    }

                    let accordWith = words.find(w => w.wordForm.pos == inflectAsPoS) 
                    let form: string
                    
                    if (!accordWith) {
                        if (inflectAsPoS == PoS.VERB) {
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

                            let words = match.words
                                .filter(w => !!(w.wordMatch == wordMatch && w.word as InflectedWord))
                                .map(w => w.word as InflectedWord)

                            let form = this.getVerbForm(words)

                            wordToString = formTransform([ PoS.VERB ], [ form ])
                        }
                        else if (DERIVATION_BY_ID[placeholder.toPosOrForm]) {
                            wordToString = derivationTransform(placeholder.toPosOrForm)
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
                    replaceWith = ''

                    match.words.forEach((w, index) => {
                        if (w.wordMatch == wordMatch) {
                            let nextWord = match.words[index+1]

                            let wordString = wordToString(w.word, match.sentence.english, nextWord && nextWord.word)

                            if (replaceWith.length) {
                                replaceWith += ' '
                            }
                            
                            replaceWith += wordString
                        }
                    })
                }
            }

            result = result.replace(placeholder.placeholder, replaceWith)
        })
/*
no idea what this is. its replacing any remaining placeholders with russian words. seems old.

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
            result = result.replace(new RegExp('(?:[ |^])' + r + '(?:[ |$])', 'g'), replace[r].map((w) => 		
                (w instanceof InflectedWord ? w.word.getDefaultInflection().jp : w.jp)		
            ).join(' '))		
        })		
*/
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
        let minWords = this.wordMatches.length

        this.wordMatches.forEach((m) => {
            if (m.allowEmptyMatch()) {
                minWords--
            }
        })

        let words = context.words

        if (!words.length) {
            return
        }

        let until = (onlyFirstWord ? 0 : words.length - minWords)

        let firstMatch = this.wordMatches[0] 

        // patterns starting with noun phrase are super-slow. it's faster to first check if 
        // the remaining patterns have any chance of matching and bailing if they don't.
        if (firstMatch instanceof PhraseMatch && firstMatch.phraseId == 'np') {
            // find the first non-phrase match without a quantifier
            let nonPhraseMatchIndex = this.wordMatches.findIndex(m => {
                if (m instanceof PhraseMatch) {
                    return false
                }

                if (m instanceof AbstractQuantifierMatch) {
                    if (m.range[0] == 0) {
                        return false
                    }
                }

                if (m.allowEmptyMatch) {
                    return false
                }

                return true
            })

            if (nonPhraseMatchIndex > 0) {
                let nonPhraseMatch = this.wordMatches[nonPhraseMatchIndex]
                let lastIndexOfNext;

                let toNumber = (n: number | Match) => {
                    if (!n) {
                        return 
                    }

                    if (typeof n == 'number') {
                        return n
                    }
                    else {
                        return n.words.length
                    }
                }

                if (context.debug) {
                    context.debug('Was there a match anywhere of ' + nonPhraseMatch.toString() + '?', DebugPosition.START)
                }

                let m = toNumber(nonPhraseMatch.matches(context, 0, this.wordMatches, nonPhraseMatchIndex))
                
                if (context.debug) {
                    context.debug(m ? 'Yes' : 'No', DebugPosition.END)
                }

                if (!m) {
                    return 
                }

                // even if we do match, we know we don't need to go longer than until the word before.
                lastIndexOfNext = m

                let next

                do {
                    next = toNumber(nonPhraseMatch.matches(context, lastIndexOfNext + 1, this.wordMatches, nonPhraseMatchIndex))

                    if (next) {
                        lastIndexOfNext = next + lastIndexOfNext + 1
                    }
                }
                while (next)

                until = lastIndexOfNext - 1
            }
        }

        for (let startAtWord = 0; startAtWord <= until; startAtWord++) {
            if (onlyFirstWord && words[startAtWord].isPunctuation()) {
                break
            }

            let matchFromWordMatch: (wordMatchIndex: number, at: number) => 
                    WordMatched[] = (wordMatchIndex, originalAt) => {
                let at = originalAt
                let wordMatch = this.wordMatches[wordMatchIndex]

                // end of pattern. match.
                if (!wordMatch) {
                    return []
                }

                let m = wordMatch.matches(context, at, this.wordMatches, wordMatchIndex)

                if (!m && wordMatchIndex > 0 && words[at] && words[at].wordForm.pos == PoS.PARTICLE) {
                    at++

                    m = wordMatch.matches(context, at, this.wordMatches, wordMatchIndex)
                }

                if (!m && !wordMatch.allowEmptyMatch()) {
                    return
                }
                else {
                    let matchedWordCount: number
                    let childMatch: Match

                    if (typeof m == 'number') {
                        matchedWordCount = m as number
                    }
                    else {
                        childMatch = m as Match
                        matchedWordCount = childMatch.words.length
                    }

                    let wordsMatched: WordMatched[] = []

                    if (!(wordMatch instanceof WildcardMatch)) {
                        for (let i = 0; i < matchedWordCount; i++) {
                            wordsMatched.push({
                                index: at+i,
                                word: words[at+i],
                                wordMatch: wordMatch,
                                childMatch: childMatch
                            })
                        }
                    }

                    let next = matchFromWordMatch(wordMatchIndex + 1, at + matchedWordCount)

                    if (next) {
                        wordsMatched = wordsMatched.concat(next)
                    }
                    else {
                        // if we fail to match the next it could have been because we are at a
                        // quantifier match and we matched it too greedily, so back up and 
                        // try again giving the quantifier match nothing.
                        if (wordMatch instanceof AbstractQuantifierMatch 
                                && wordMatch.range[0] == 0 
                                && wordsMatched.length) {
                            wordsMatched = matchFromWordMatch(wordMatchIndex + 1, originalAt)
                        }
                        else {
                            wordsMatched = null
                        }
                    }

                    return wordsMatched
                }
            }

            let wordsMatched = matchFromWordMatch(0, startAtWord)

            if (wordsMatched && wordsMatched.length) {
                return {
                    sentence: context.sentence,
                    words: wordsMatched,
                    pattern: this,
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

    hasCase(grammaticalCase: GrammarCase): boolean {
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

        if (posStr && !POS_BY_LONG_NAME[posStr]) {
            throw new Error(`Unknown part of speech "${posStr}" on line "${line}". Should be one of ${ Object.keys(POS_BY_LONG_NAME).join(', ') }.`)
        }

        if (posStr == 'adverb' && !formStr) {
            return new AdverbWordMatch(quantifier)
        }

        let wordForms = []

        if (posStr) {
            wordForms.push(findNamedWordFormForPoS(posStr))
        }

        return new PosFormWordMatch(wordForms, FORMS[formStr], quantifier)
    }

    getWords(): Set<AnyWord> {
        let result = new Set<AnyWord>()

        let addWord = (word: AnyWord) => {
            if (!word.isPunctuation()) {
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

    getCaseStudyCase(): Set<GrammarCase> {
        let result = new Set<GrammarCase>()

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

    getAnyCase(): Set<GrammarCase> {
        let result = new Set<GrammarCase>()

        this.wordMatches.forEach((wordMatch) => {
            let grammaticalCase

            let form = wordMatch.getInflectionForm()
            
            if (form) {
                grammaticalCase = form.grammaticalCase
            }
            else if (wordMatch.isCaseStudy()) {
                grammaticalCase = (wordMatch as CaseStudyMatch).getCaseStudied()
            }

            if (grammaticalCase) {
                result.add(grammaticalCase)
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

            // Legacy. remove
            if (str.indexOf('@') > 0 && POS_BY_LONG_NAME[str.substr(0, str.indexOf('@'))]) {
                match = this.parseFormMatch(str, line)
            }
            // Legacy. remove
            else if (FORMS[str]) {
                match = new PosFormWordMatch([], FORMS[str], null)
            }
            else if (WORD_FORMS[str]) {
                match = new PosFormWordMatch([ WORD_FORMS[str] ], null, null)
            }
            // Legacy. remove
            else if (POS_BY_LONG_NAME[str]) {
                if (str == 'adverb') {
                    match = new AdverbWordMatch()
                }
                else {
                    match = new PosFormWordMatch([ findNamedWordFormForPoS(str) ], null, null)
                }
            }
            // Legacy. remove
            else if (POS_BY_LONG_NAME[str.substr(0, str.length-1)] && QUANTIFIERS[str[str.length-1]]) {
                let posStr = str.substr(0, str.length-1) 
                let quantifier = str[str.length-1]

                if (posStr == 'adverb') {
                    match = new AdverbWordMatch(quantifier)
                }
                else {
                    match = new PosFormWordMatch([ findNamedWordFormForPoS(posStr) ], null, quantifier)
                }
            }
            else if (str.substr(0, 7) == 'phrase:') {
                str = str.substr(7)

                let hash = str.match(/#([^@]*)/)
                let at = str.match(/@([^#]*)/)

    	        let grammaticalCase: GrammarCase
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
            else if (str == 'any') {
                match = new WildcardMatch()
            }
            else {
                let originalStr = str

                let quantifier = null
                
                if (QUANTIFIERS[str[str.length-1]]) {
                    quantifier = str[str.length-1]
                    str = str.substr(0, str.length-1)
                }

                let els = str.split('@')

                let inflectionForm: InflectionForm
                let wordForms: NamedWordForm[] = []

                if (els[1]) {
                    inflectionForm = FORMS[els[1]]

                    if (!inflectionForm) {
                        if (els[1] == 'adv') {
                            wordForms = [ WORD_FORMS['adv'] ]
                        }
                        else {
                            throw new Error(`"${els[1]} in ${originalStr} was not recognized as an inflection form. Valid forms are: ${ Object.keys(FORMS).join(', ') }.`)
                        }
                    }
                }

                str = els[0]
                els = str.split('#')

                let tag: string

                if (els[1]) {
                    tag = els[1]
                    str = els[0]
                }

                let matchWords: AnyWord[] = []

                if ((str.indexOf(',') >= 0 && str != ',') || WORD_FORMS[str] || FORMS[str]) {
                    wordForms = str.split(',').map(form => {
                        let result = WORD_FORMS[form] 

                        if (!result) {
                            throw new Error(`Unknown word form "${form}" in "${originalStr}". Valid forms are: ${ Object.keys(WORD_FORMS).join(', ') }.`)
                        }

                        return result
                    })
                }
                else if (str) {
                    matchWords = str.split('|').map((w) => {
                        let result = words.wordsById[w] || words.inflectableWordsById[w]

                        if (!result) {
                            result = words.wordsByString[w]

                            if (!result) {
                                throw new Error(`Word "${w}" (specified in "${originalStr}") is unknown. Did you mean ${words.getSimilarTo(w).join(', ')}?`)
                            }
                        }

                        return result
                    })                    
                }

                if (tag) {
                    if (matchWords.length) {
                        throw new Error(`Cannot specify both words and tag in ${line}`)
                    }

        	        match = new TagWordMatch(tag, wordForms, inflectionForm, quantifier)
                }
                else if (matchWords.length && !wordForms.length && !inflectionForm && !quantifier) {
                    match = new ExactWordMatch(matchWords)
                }
                else if (matchWords.length && inflectionForm) {
                    if (matchWords.find(w => w instanceof Word)) {
                        throw new Error(`${matchWords.find(w => w instanceof Word).toText()} is not inflectable.`)
                    }

                    match = new WordInFormMatch(matchWords.map(w => (w instanceof InflectableWord ? w : null)).filter(w => !!w), 
                        inflectionForm, quantifier)
                }
                else {
                    if (matchWords.length) {
                        throw new Error(`Cannot word with other criteria in ${line}`)
                    }

                    match = new PosFormWordMatch(wordForms, inflectionForm, quantifier)
                }
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

function findNamedWordFormForPoS(posStr: string) {
    let pos = POS_BY_LONG_NAME[posStr]

    if (!pos) {
        throw new Error(`No PoS named "${pos}".`)
    }

    let unnamedWordForm = new WordForm({ pos: pos })

    let namedWordForm = Object.keys(WORD_FORMS).map(i => WORD_FORMS[i]).find(form => form.equals(unnamedWordForm))

    if (!namedWordForm) {
        throw new Error(`Could not find a named word form for ${ POS_BY_LONG_NAME[posStr] } (from ${posStr}).`)
    }

    return namedWordForm
}