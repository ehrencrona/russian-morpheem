
import WordMatch from './WordMatch'
import ExactWordMatch from './ExactWordMatch'
import CaseWordMatch from './CaseWordMatch'
import TagWordMatch from './TagWordMatch'
import Corpus from '../Corpus'
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

    match(words: Word[]): Word[] {
        for (let i = 0; i <= words.length - this.wordMatches.length; i++) {
            let at = i
            let found = true

            for (let j = 0; j < this.wordMatches.length; j++) {
                let match = this.wordMatches[j].matches(words.slice(at))

                if (!match) {
console.log(this.wordMatches[j] , ' did not match ', words[at])
                    found = false
                    break
                }
else {
    console.log(this.wordMatches[j] , ' did match ', words[at], match)

}
                at += match
            }

            if (found) {
                return words.slice(i, at)
            }
        }
    }

    static fromString(str: string, corpus: Corpus) {
        let wordMatches: WordMatch[] = []
        
        str.split(' ').forEach((str) => {
            let match: WordMatch

            if (str[0] == '@') {

                let caseStr = str.substr(1)

                let grammaticalCase = FORMS[caseStr].grammaticalCase

                if (grammaticalCase == null) {
                    throw new Error(`Unknown case "${caseStr}". Should be acc, gen, nom, dat, instr or prep.`)
                }
                
                match = new CaseWordMatch(grammaticalCase, caseStr)
            }
            else if (str.indexOf('@') > 0) {

                let wordStr
                let word
                
                if (str[str.length-1] == '@') {
                    wordStr = str.substr(0, str.length-1)
                    
                    let fact = corpus.facts.get(wordStr) 
                    
                    if (fact instanceof InflectableWord || fact instanceof UnstudiedWord) {
                        word = fact
                    }
                    else {
                        if (!fact) {
                            throw new Error(`"${wordStr}" is not a known fact.`)
                        }
                        else {
                            throw new Error(`"${wordStr}" does not seem to be a word but some other fact.`)
                        }
                    }
                }
                else {
                    wordStr = str

                    word = corpus.words.get(wordStr)
                }

                if (!word) {
                    throw new Error(`Unknown word "${wordStr}". did you mean ${corpus.words.getSimilarTo(wordStr)}?`)
                }

                match = new ExactWordMatch(word)
            }
            else if (str.substr(0, 4) == 'tag:') {
                let tagStr = str.substr(4)

                if (!corpus.facts.getFactIdsWithTag(tagStr).size) {
                    throw new Error(`Unknown or empty tag "${tagStr}".`)
                }

    	        match = new TagWordMatch(tagStr, corpus.facts)
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