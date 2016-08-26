
import WordMatch from './WordMatch'
import WildcardMatch from './WildcardMatch'
import { ExactWordMatch, AnyWord } from './ExactWordMatch'
import PosFormWordMatch from './PosFormWordMatch'
import WordInFormMatch from './WordInFormMatch'
import { POS_NAMES } from './PosFormWordMatch'
import TagWordMatch from './TagWordMatch'
import { QUANTIFIERS } from './AbstractQuantifierMatch'
import Words from '../Words'
import Inflections from '../inflection/Inflections'
import Facts from '../fact/Facts'
import Word from '../Word'
import { ENGLISH_FORMS_BY_POS, FORMS, GrammaticalCase, InflectionForm } from '../inflection/InflectionForms'
import InflectableWord from '../InflectableWord'
import InflectedWord from '../InflectedWord'
import EnglishPatternFragment from './EnglishPatternFragment'
import PhraseMatch from './PhraseMatch'
import AdverbWordMatch from './AdverbWordMatch'
import Corpus from '../Corpus'
import MatchContext from './MatchContext'
import { Match, WordMatched } from './Match'

export enum CaseStudy {
    STUDY_CASE, STUDY_WORDS, STUDY_BOTH
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
    agreeWithForm: InflectionForm
    agreeWithPoS: string
    inflections: string[]
    fromToForm: string[]
}

class Fragment implements EnglishPatternFragment {
    placeholders: Placeholder[]

    constructor(public enString: string, public placeholder: boolean, public placeholderIndex: number, public placeholderOverrideForm) {
        this.enString = enString
        this.placeholder = placeholder
        this.placeholderIndex = placeholderIndex
        this.placeholderOverrideForm = placeholderOverrideForm
        this.placeholders = [];

        (enString.match(/\(([^)]*)\)/g) || []).forEach(placeholder => {
            let params = placeholder.substr(1, placeholder.length-2).split(',')

            if (!params.length) {
                console.warn(`Empty placeholder in phrase ${enString}.`)
                return
            }

            let fromToForm = params[params.length-1].split('->')
            
            let words: InflectedWord[]
            
            let fromPosAtForm = fromToForm[0]

            let inflectAsPoS

            let fragmentIndex
            let agreeWithForm
            let agreeWithPoS
            let replaceWith = '' 

            {
                let els = fromPosAtForm.split('@') 

                if (els.length > 1) {
                    agreeWithForm = FORMS[els[1]]
                    agreeWithPoS = els[0]
                }
            }

            agreeWithForm = FORMS[fromPosAtForm]

            if (!agreeWithForm) {
                agreeWithPoS = fromPosAtForm
            }

            let inflections

            if (params.length > 1) {
                inflections = params.slice(0, params.length-1) 
            }

            this.placeholders.push({
                fromToForm: fromToForm,
                placeholder: placeholder,
                fragmentIndex: (parseInt(fromPosAtForm) ? parseInt(fromPosAtForm) : null),
                agreeWithForm: agreeWithForm,
                agreeWithPoS: agreeWithPoS,
                inflections: inflections
            })
        })
    }

    toString() { 
        return this.en 
    }

    enWithJpForCases(match: Match) {
        if (this.placeholder) {
            let atCaseStudyIndex = -1
            let atWordMatch 

            let m: WordMatched[] = match.words.filter((m) => {
                let wordMatch = m.wordMatch

                if (wordMatch.isCaseStudy()) {
                    if (wordMatch != atWordMatch) {
                        atCaseStudyIndex++

                        atWordMatch = wordMatch 
                    }

                    return atCaseStudyIndex == this.placeholderIndex
                }
            })

            if (!m.length) {
                console.log(`Placeholders didn't match case studies in pattern "${this.toString()}"`)

                return this.en(match)
            }

            return m.map((wordMatched) => {
                let placeholderWord = wordMatched.word
                
                if (placeholderWord instanceof InflectedWord) {
                    return placeholderWord.word.getDefaultInflection().jp 
                }
                else {
                    return placeholderWord.jp
                }
            }).join(' ')
        }
        else {
            return this.en(match)
        }        
    }

    en(match: Match): string {
        let result = this.enString

        this.placeholders.forEach(placeholder => {
            let replaceWith: string

            if (placeholder.fragmentIndex) {
                let at = 0
                let wordMatch = match.pattern.wordMatches[placeholder.fragmentIndex-1]

                if (wordMatch instanceof PhraseMatch) {
                    let wordMatched: WordMatched = match.words.find((w) => w.wordMatch == wordMatch)

                    let childMatch = wordMatched.childMatch

                    replaceWith = childMatch.pattern.getEnglishFragments().map(f => f.en(childMatch)).join(' ')

                    if (match.sentence && match.sentence.en()) {
                        let search = wordMatched.word.getEnglish()
                        let i = -1
                        let en = match.sentence.en()
                        let found = false

                        do {
                            i = en.indexOf(search, i+1)

                            if (i >= 0) {
                                found = true

                                if (en.substr(i-2, 2) == 'a ') {
                                    replaceWith = 'a ' + replaceWith
                                    break
                                }
                                else if (en.substr(i-4, 4) == 'the ') {
                                    replaceWith = 'the ' + replaceWith
                                    break
                                }
                            }
                        }
                        while (i >= 0)

                        if (!found) {
                            console.log(`did not find "${search}" in "${en}"`)
                        }
                    }
                }
                else {
                    replaceWith = match.words.filter((w) => w.wordMatch == wordMatch)
                        .map(w => w.word.getEnglish()).join(' ')
                }
            }
            else {
                let agreeWithForm = placeholder.agreeWithForm
                let agreeWithPoS = placeholder.agreeWithPoS
                let fromToForm = placeholder.fromToForm

                let words = match.words.map(m => m.word as InflectedWord)

                if (agreeWithForm) {
                    words = words.filter(word => {
                        return word instanceof InflectedWord && agreeWithForm.matches(FORMS[word.form])
                    })

                    if (!words.length) {
                        console.warn(`No words with form ${agreeWithForm.id} in phrase translated as ${result}`)
                    }
                }

                if (agreeWithPoS) {
                    words = words.filter(word => word.pos == agreeWithPoS)

                    if (!words.length) {
                        console.warn(`No words matching PoS ${agreeWithPoS} in phrase translated as ${result}`)
                    }
                }

                if (!placeholder.inflections) {
                    if (fromToForm.length > 1) {
                        let enForm = fromToForm[1]

                        replaceWith = words.map(w => w.en[enForm] || w.en['']).join(' ')
                    }
                    else {
                        replaceWith = words.map(w => w.getEnglish()).join(' ')
                    }
                }
                else if (words.length) {
                    let inflectAsPoS

                    if (fromToForm.length > 1) {
                        inflectAsPoS = fromToForm[1]
                    }
                    else if (agreeWithPoS) {
                        inflectAsPoS = agreeWithPoS
                    }
                    else {
                        console.warn(`When agreeing with a case, PoS of forms must be specified in phrase translated as ${result}`)
                        inflectAsPoS = 'v'
                    }

                    replaceWith = getEnglishInflectionFromList(inflectAsPoS, words[0].form, placeholder.inflections)
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

        return result                           
    }
}

export default class PhrasePattern {
    // it's helpful for React to have a unique ID.
    key = counter++ 
    englishFragmentsCache: EnglishPatternFragment[]

    constructor(public wordMatches: WordMatch[], public en: string) {
        this.wordMatches = wordMatches
        this.en = en
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

    getEnglishFragments(): EnglishPatternFragment[] {
        if (!this.englishFragmentsCache) {
            this.englishFragmentsCache = this.calculateEnglishFragments()
        }

        return this.englishFragmentsCache
    }

    calculateEnglishFragments(): EnglishPatternFragment[] {
        let split = this.en.match(/(\[[^\]]+\]|[^\[]+)/g)
        let placeholderCount = 0

        let result: EnglishPatternFragment[] = []
        
        if (!split) {
            return result
        }

        split.map((str) => {
            str.split('...').forEach((str) => {
                str = str.trim()

                if (!str) {
                    return
                }

                let en = str

                let placeholder = str[0] == '['
                let placeholderIndex = placeholderCount
                let placeholderOverrideForm

                if (placeholder) {
                    let end = str.indexOf(']')

                    if (end < 0) {
                        end = str.length
                    }

                    str = str.substr(1, end-1)

                    let els = str.split('->')

                    en = els[0]

                    if (els.length > 1) {
                        placeholderOverrideForm = els[els.length-1]
                    }

                    placeholderCount++
                }

                result.push(new Fragment(en, placeholder, placeholderIndex, placeholderOverrideForm))
            })
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