
import WordMatch from './WordMatch'
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

        if (!this.wordMatches.length || !this.wordMatches[0]) {
            throw new Error(`No word matches specified.`)
        }
    }

    match(words: Word[], facts: Facts): Word[] {
        for (let i = 0; i <= words.length - this.wordMatches.length; i++) {
            let at = i
            let found = true

            for (let j = 0; j < this.wordMatches.length; j++) {
                let match = this.wordMatches[j].matches(words.slice(at), facts)

                if (!match) {
                    found = false
                    break
                }

                at += match
            }

            if (found) {
                return words.slice(i, at)
            }
        }
    }

    static fromString(line: string, words: Words) {
        let wordMatches: WordMatch[] = []
        
        line.split(' ').forEach((str) => {
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
                    
                    word = words.get(wordStr) 
                    
                    if (!word) {
                        word = words.inflectableWordsById[wordStr] 
                    }
                }
                else {
                    wordStr = str

                    word = words.get(wordStr)
                }

                if (!word) {
                    throw new Error(`Unknown word "${ wordStr }". did you mean ${ words.getSimilarTo(wordStr) }?`)
                }

                match = new ExactWordMatch(word)
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