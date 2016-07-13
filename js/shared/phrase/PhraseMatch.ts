
import WordMatch from './WordMatch'
import WildcardMatch from './WildcardMatch'
import { ExactWordMatch, AnyWord } from './ExactWordMatch'
import CaseWordMatch from './CaseWordMatch'
import TagWordMatch from './TagWordMatch'
import Words from '../Words'
import Facts from '../fact/Facts'
import Word from '../Word'
import { FORMS, GrammaticalCase } from '../inflection/InflectionForms'
import InflectableWord from '../InflectableWord'
import UnstudiedWord from '../UnstudiedWord'

export default class PhraseMatch {
    constructor(public wordMatches: WordMatch[]) {
        this.wordMatches = wordMatches
    }

    match(words: Word[], facts: Facts): Word[] {
        for (let i = 0; i <= words.length - this.wordMatches.length; i++) {
            let at = i
            let found = true
            let result: Word[] = []

            for (let j = 0; j < this.wordMatches.length; j++) {
                let wordMatch = this.wordMatches[j]

                let match = wordMatch.matches(words, at, this.wordMatches, j, facts)

                if (!match) {
                    found = false
                    break
                }

                if (!(wordMatch instanceof WildcardMatch)) {
                    result = result.concat(words.slice(at, at + match))
                }

                at += match
            }

            if (found) {
                return result
            }
        }
    }

    static fromString(line: string, words: Words) {
        let wordMatches: WordMatch[] = []
        
        line.split(' ').forEach((str) => {
            if (!str) {
                return
            }

            let match: WordMatch

            if (str[0] == '@') {
                let caseStr = str.substr(1)

                if (FORMS[caseStr] == null) {
                    throw new Error(`Unknown form "${caseStr}" on line "${line}". Should be acc, gen, nom, dat, instr or prep.`)
                }

                let grammaticalCase = FORMS[caseStr].grammaticalCase

                if (grammaticalCase == null) {
                    throw new Error(`"${caseStr}" is not a case but some other form. Should be acc, gen, nom, dat, instr or prep.`)
                }
                
                match = new CaseWordMatch(grammaticalCase, caseStr)
            }
            else if (str.indexOf('@') > 0) {
                let wordStr
                let word: AnyWord
                
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
            else if (str == 'any') {
                match = new WildcardMatch()
            }
            else if (str.substr(0, 4) == 'tag:') {
                let tagStr = str.substr(4)

    	        match = new TagWordMatch(tagStr)
            }
            else {
                throw new Error(`Unknown word match "${str}". Should either be @case for a case, word@ for a word or tag:tagName for a tag.`)
            }

            wordMatches.push(match)
        })

        return new PhraseMatch(wordMatches)
    }

    toString() {
        return this.wordMatches.map((wm) => wm.toString()).join(' ')
    }

}