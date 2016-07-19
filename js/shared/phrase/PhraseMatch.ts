
import WordMatch from './WordMatch'
import WildcardMatch from './WildcardMatch'
import { ExactWordMatch, AnyWord } from './ExactWordMatch'
import FormWordMatch from './FormWordMatch'
import TagWordMatch from './TagWordMatch'
import PoSWordMatch from './PoSWordMatch'
import { QUANTIFIERS, POS_NAMES } from './PoSWordMatch'
import Words from '../Words'
import Inflections from '../inflection/Inflections'
import Facts from '../fact/Facts'
import Word from '../Word'
import { FORMS, GrammaticalCase } from '../inflection/InflectionForms'
import InflectableWord from '../InflectableWord'
import UnstudiedWord from '../UnstudiedWord'

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

            if (found) {
                return result
            }
        }
    }

    static fromString(line: string, words: Words, inflections: Inflections) {
        let wordMatches: WordMatch[] = []
        
        line.split(' ').forEach((str) => {
            if (!str) {
                return
            }

            let match: WordMatch

            if (str[0] == '@' || FORMS[str]) {
                let caseStr = str

                if (caseStr[0] == '@') {
                    caseStr = caseStr.substr(1)
                }

                if (FORMS[caseStr] == null) {
                    throw new Error(`Unknown form "${caseStr}" on line "${line}". Should be one of ${ Object.keys(FORMS).join(', ') }.`)
                }

                match = new FormWordMatch(FORMS[caseStr], caseStr)
            }
            else if (POS_NAMES[str]) {
                match = new PoSWordMatch(POS_NAMES[str], str)
            }
            else if (POS_NAMES[str.substr(0, str.length-1)] && QUANTIFIERS[str[str.length-1]]) {
                match = new PoSWordMatch(POS_NAMES[str.substr(0, str.length-1)], str.substr(0, str.length-1), str[str.length-1])
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
                throw new Error(`Unknown word match "${str}". Should either be a form, a part of speach (${ Object.keys(POS_NAMES).join(', ')}), 'any', word@, 'tag:tagName' or 'tag:tagName@case'. Type '@form' to see all forms.`)
            }

            wordMatches.push(match)
        })

        return new PhraseMatch(wordMatches)
    }

    toString() {
        return this.wordMatches.map((wm) => wm.toString()).join(' ')
    }

}