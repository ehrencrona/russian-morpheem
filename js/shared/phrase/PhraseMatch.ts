
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

export default class PhraseMatch {
    constructor(public wordMatches: WordMatch[]) {
        this.wordMatches = wordMatches
    }

    match(words: Word[], facts: Facts): number[] {
        for (let i = 0; i <= words.length - this.wordMatches.length; i++) {
            let at = i
            let found = true
            let result: number[] = []

            for (let j = 0; j < this.wordMatches.length; j++) {
                let wordMatch = this.wordMatches[j]

                let match = wordMatch.matches(words, at, this.wordMatches, j, facts)

                if (!match && !wordMatch.allowEmptyMatch()) {
                    found = false
                    break
                }

                if (!(wordMatch instanceof WildcardMatch)) {
                    for (let i = 0; i < match; i++) {
                        result.push(at+i)
                    }
                }

                at += match
            }

            if (found && result.length) {
                return result
            }
        }
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

    static fromString(line: string, words: Words, inflections: Inflections) {
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

        return new PhraseMatch(wordMatches)
    }

    toString() {
        return this.wordMatches.map((wm) => wm.toString()).join(' ')
    }

}