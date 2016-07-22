
import Word from './Word'
import InflectedWord from './InflectedWord'
import InflectableWord from './InflectableWord'
import Inflection from './inflection/Inflection'
import Facts from './fact/Facts'
import UnparsedWord from './UnparsedWord'

import { JsonFormat as InflectableWordJsonFormat } from './InflectableWord'
import { JsonFormat as WordJsonFormat } from './Word'

export type JsonFormat = (InflectableWordJsonFormat | WordJsonFormat)[]

export default class Words {
    wordsByString : { [s: string]: Word } = {}
    wordsById : { [s: string]: Word } = {}
    inflectableWordsById : { [s: string]: InflectableWord } = {}
    
    ambiguousForms : { [s: string]: Word[] } = {}

    onAddWord: (word: Word) => void = null
    onDeleteWord: (word: Word) => void = null
    onAddInflectableWord: (word: InflectableWord) => void = null
    
    static PUNCTUATION = '.?!,;:«»—'
    static PUNCTUATION_NOT_PRECEDED_BY_SPACE = '.?!,:;»'
    static SENTENCE_ENDINGS = '.?!—'

    sortedWords: Word[]

    constructor(facts?: Facts) {
        if (facts) {
            for (let fact of facts.facts) {
                if ((fact instanceof Word)) {
                    this.addWord(fact);
                }
                else if (fact instanceof InflectableWord) {
                    this.addInflectableWord(fact)
                }
            }
        }
    }
    
    clone(words: Words) {
        this.wordsById = words.wordsById
        this.wordsByString = words.wordsByString
        this.ambiguousForms = words.ambiguousForms
    }

    getPunctuationWords() {
        return Words.PUNCTUATION.split('').map((char) => {
            let result = new Word(char, null)

            result.studied = false

            return result
        })
    }

    addPunctuation() {
        this.getPunctuationWords().forEach((word) => 
            this.addWord(word)
        )
    }

    index(word: Word) {
        if (this.wordsById[word.getId()]) {
            throw new Error('Multiple words with ID ' + word.getId() + '.');
        }
        
        this.wordsById[word.getId()] = word;

        let str = word.jp;

        let ambiguous = this.ambiguousForms[str]

        if (ambiguous) {
            ambiguous.push(word)
        }
        else if (this.wordsByString[str]) {
            ambiguous = [ word, this.wordsByString[str] ]
            this.ambiguousForms[str] = ambiguous

            delete this.wordsByString[str]
        }
        else {
            this.wordsByString[str] = word
        }

        this.sortedWords = null
    }

    remove(word: Word) {
        delete this.wordsById[word.getId()]

        let str = word.jp;

        let ambiguous = this.ambiguousForms[str]

        if (ambiguous) {
            ambiguous = ambiguous.filter((w) => w.getId() != word.getId())

            if (ambiguous.length == 1) {
                this.wordsByString[str] = ambiguous[0]

                delete this.ambiguousForms[str]
            }
            else {
                this.ambiguousForms[str] = ambiguous
            }
        }
        else {
            delete this.wordsByString[str]
        }

        this.sortedWords = null
    }

    wordsStartingWith(prefix: string): Word[] {
        if (!this.sortedWords) {
            this.sortedWords = 
                Object.keys(this.wordsById)
                .map((id) => 
                    this.wordsById[id])
                .sort((w1: Word, w2: Word) => 
                    w1.jp.toLowerCase().localeCompare(w2.jp.toLowerCase())
                )
        }

        prefix = prefix.toLowerCase()

        let i = this.sortedWords.findIndex((w: Word) => 
            w.jp.toLowerCase().localeCompare(prefix) >= 0
        )

        let result = []

        if (i >= 0) {
            while (i < this.sortedWords.length &&
                    this.sortedWords[i].jp.toLowerCase().substr(0, prefix.length) == prefix) {
                result.push(this.sortedWords[i])
                i++
            }
        }

        return result
    }

    addWord(word: Word) {
        if (word instanceof InflectedWord) {
            throw new Error('Use addInflectableWord for inflected words.')
        }
        
        this.index(word)
                
        if (this.onAddWord) {
            this.onAddWord(word)
        }

        return this
    }

    addInflectableWord(word: InflectableWord) {
        word.visitAllInflections((word: InflectedWord) =>
            this.index(word)
        )

        if (this.onAddInflectableWord) {
            this.onAddInflectableWord(word)
        }

        this.inflectableWordsById[word.getId()] = word

        return this
    }

    removeInflectableWord(word: InflectableWord) {
        word.visitAllInflections((word: InflectedWord) =>
            this.remove(word)
        )

        delete this.inflectableWordsById[word.getId()]

        return this
    }

    get(id: string): Word {
        let result = this.wordsByString[id]
        
        if (result) {
            return result
        }

        if (id[0] == '"' && id[id.length-1] == '"') {
            return new UnparsedWord(id.substr(1, id.length-2))
        }

        return this.wordsById[id]
    }
    
    getSimilarTo(token) {
        let exactMatches = Object.keys(this.wordsById).map((id) => this.wordsById[id]).filter((word) => word.jp == token).map((word) => word.getId())        

        if (exactMatches.length) {
            return exactMatches
        }
        
        
        let sameLetter = Object.keys(this.wordsById).filter((word) => word[0] == token[0])

        let byMatchLength = sameLetter.map((word) => {
            let i;
            
            for (i = 1; i < word.length; i++) {
                if (word[i] !== token[i]) {
                    break
                }
            }

            return [ word, i ]
        }).sort((pair1, pair2) => pair2[1] - pair1[1]);

        for (let i = 1; i < byMatchLength.length; i++) {
            if (byMatchLength[i][1] < byMatchLength[i-1][1]) {
                byMatchLength = byMatchLength.slice(0, i);
                break
            }
        }

        let split = token.split('@');
        
        let suggestions = byMatchLength.map((match) => match[0]);
        
        if (split[1]) {
            let rightForm = suggestions.filter((word) => {
                return word.split('@')[1] == split[1]
            })
            
            if (rightForm.length) {
                suggestions = rightForm
            }
        }
        
        return suggestions
    }
       
    static fromJson(json: JsonFormat, inflections) {
        let result = new Words();
        
        json.forEach((wordJson) => {
            if (wordJson.type == InflectableWord.getJsonType()) {
                result.addInflectableWord(
                    InflectableWord.fromJson(wordJson as InflectableWordJsonFormat, inflections))
            }
            else {
                result.addWord(InflectedWord.fromJson(wordJson as WordJsonFormat, inflections))
            }
        })
        
        return result
    }
    
    toJson(): JsonFormat {        
        let result: JsonFormat = []

        for (let id in this.wordsById) {
            let word = this.wordsById[id]
            
            if (word instanceof InflectedWord) {
                if (word.getDefaultInflection() !== word) {
                    continue
                }
                else {
                    result.push(word.word.toJson())    
                }
            }
            else {
                result.push(word.toJson())    
            }
            
        }
        
        return result
    }
}
 
