
import WordMatch from './WordMatch'
import WildcardMatch from './WildcardMatch'
import { ExactWordMatch, AnyWord } from './ExactWordMatch'
import PosFormWordMatch from './PosFormWordMatch'
import { POS_NAMES } from './PosFormWordMatch'
import TagWordMatch from './TagWordMatch'
import { QUANTIFIERS } from './AbstractQuantifierMatch'
import Words from '../Words'
import Inflections from '../inflection/Inflections'
import Facts from '../fact/Facts'
import Word from '../Word'
import { FORMS, GrammaticalCase } from '../inflection/InflectionForms'
import InflectableWord from '../InflectableWord'
import InflectedWord from '../InflectedWord'
import EnglishPatternFragment from './EnglishPatternFragment'

export enum CaseStudy {
    STUDY_CASE, STUDY_WORDS, STUDY_BOTH
}

export interface JsonFormat {
    pattern: string,
    en: string
}

export interface Match {
    words: WordMatched[]
    pattern: PhrasePattern
}

export interface WordMatched {
    wordMatch: WordMatch
    word: Word
    index: number
}

export default class PhrasePattern {
    constructor(public wordMatches: WordMatch[], public en: string) {
        this.wordMatches = wordMatches
        this.en = en
    }

    match(words: Word[], facts: Facts, caseStudy?: CaseStudy): Match {
        if (caseStudy == null) {
            caseStudy = CaseStudy.STUDY_BOTH
        }

        let minWords = this.wordMatches.length

        this.wordMatches.forEach((m) => {
            if (m.allowEmptyMatch()) {
                minWords--
            }
        })

        for (let i = 0; i <= words.length - minWords; i++) {
            let at = i
            let found = true
            let wordsMatched: WordMatched[] = []

            for (let j = 0; j < this.wordMatches.length; j++) {
                let wordMatch = this.wordMatches[j]

                let match = wordMatch.matches(words, at, this.wordMatches, j, facts)

                if (!match && !wordMatch.allowEmptyMatch()) {
                    found = false
                    break
                }

                if (!(wordMatch instanceof WildcardMatch) &&
                    (caseStudy == CaseStudy.STUDY_BOTH || 
                     wordMatch.isCaseStudy() == (caseStudy == CaseStudy.STUDY_CASE))) {
                    for (let i = 0; i < match; i++) {
                        wordsMatched.push({
                            index: at+i,
                            word: words[at+i],
                            wordMatch: wordMatch
                        })
                    }
                }

                at += match
            }

            if (found && words.length) {
                return {
                    words: wordsMatched,
                    pattern: this
                }
            }
        }
    }

    getEnglishFragments(): EnglishPatternFragment[] {
        let split = this.en.match(/(\[[^\]]+\]|[^\[]+)/g)
        let placeholderCount = 0

        let result: EnglishPatternFragment[] = []
        
        if (!split) {
            return result
        }

        split.map((str) => {
            str.split('...').forEach((str) => {
                str = str.trim()

                let en = str

                let placeholder = str[0] == '['
                let placeholderIndex = placeholderCount

                if (placeholder) {
                    en = str.substr(1, str.length-2)

                    placeholderCount++
                }

                result.push({
                    placeholder: placeholder,
                    enWithJpForCases: (match: Match) => {
                        
                        if (placeholder) {
                            let m = match.words.filter((m) => m.wordMatch.isCaseStudy())[placeholderIndex]

                            if (!m) {
                                console.log(`Placeholders didn't match case studies in pattern "${this.toString()}"`)

                                return en
                            }

                            let placeholderWord = m.word

                            return (placeholderWord instanceof InflectedWord ? 
                                placeholderWord.word.getDefaultInflection().jp : 
                                placeholderWord.jp)
                        }
                        else {
                            let replace: { [key: string]: Word[]} = {}
        console.log(match)
                            match.words.forEach((m) => {
                                let mStr = m.wordMatch.toString()
        console.log('mStr', mStr)
                                if (en.indexOf(mStr) >= 0) {
                                    let r = replace[mStr]

                                    if (!r) {
                                        r = []
                                        replace[mStr] = r
                                    }

                                    r.push(m.word)
                                }
                            })

                            Object.keys(replace).forEach((r) => {
        console.log('replace',r,'with', replace[r].map((w) => w.jp).join(' '))

                                en = en.replace(new RegExp(r, 'g'), replace[r].map((w) => 
                                    (w instanceof InflectedWord ? w.word.getDefaultInflection().jp : w.jp)
                                ).join(' '))
                            })

                            return en                                     
                        }

                    },
                    en: (match: Match) => {
                        let replace: { [key: string]: Word[]} = {}
    console.log(match)
                        match.words.forEach((m) => {
                            let mStr = m.wordMatch.toString()
    console.log('mStr', mStr)
                            if (en.indexOf(mStr) >= 0) {
                                let r = replace[mStr]

                                if (!r) {
                                    r = []
                                    replace[mStr] = r
                                }

                                r.push(m.word)
                            }
                        })

                        Object.keys(replace).forEach((r) => {
    console.log('replace',r,'with', replace[r].map((w) => w.jp).join(' '))

                            en = en.replace(r, replace[r].map((w) => w.getEnglish()).join(' '))
                        })

                        return en                                     
                    } 
                })
            })
        })

        return result
    }

    static parseFormMatch(str: string, line: string) {
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
                match = new PosFormWordMatch(str, null, null, null)
            }
            else if (POS_NAMES[str.substr(0, str.length-1)] && QUANTIFIERS[str[str.length-1]]) {
                match = new PosFormWordMatch(str.substr(0, str.length-1), null, null, str[str.length-1])
            }
            else if (str.substr(0, 4) == 'tag:') {
                let els = str.substr(4).split('@')

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
            else if (str.indexOf('@') > 0 || words.inflectableWordsById[str] || words.get(str)) {
                let wordStr
                let word: AnyWord
                
                if (str.indexOf('@') < 0) {
                    str += '@'
                }

                if (str[str.length-1] == '@') {
                    wordStr = str.substr(0, str.length-1)
                    
                    word = words.inflectableWordsById[wordStr] 
                    
                    if (!word) {
                        word = words.get(wordStr) 
                    }
                }
                else {
                    wordStr = str

                    word = words.get(wordStr)
                }

                if (!word) {
                    throw new Error(`Unknown word "${ wordStr }". did you mean ${ words.getSimilarTo(wordStr).join(', ') }?`)
                }

                match = new ExactWordMatch(word)
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