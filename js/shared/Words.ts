
import Word from './Word'
import InflectedWord from './InflectedWord'
import InflectableWord from './InflectableWord'
import Inflection from './Inflection'
import Facts from './Facts'
import UnstudiedWord from './UnstudiedWord';

export default class Words {
    wordsByString : { [s: string]: Word } = {}
    wordsById : { [s: string]: Word } = {}
    
    ambiguousForms : { [s: string]: Word[] } = {}

    onAddWord: (word: Word) => void = null
    onAddInflectableWord: (word: InflectableWord) => void = null
    onChangeInflection: (word: InflectableWord, oldId: string) => void = null

    static PUNCTUATION = '.?!,;:«»—'
    static PUNCTUATION_NOT_PRECEDED_BY_SPACE = '.?!,:;»'
    static SENTENCE_ENDINGS = '.?!—'

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
        return Words.PUNCTUATION.split('').map((char) =>
            new UnstudiedWord(char, null))
    }

    addPunctuation() {
        this.getPunctuationWords().forEach((word) =>
            this.addWord(word)
        )
    }

    index(word: Word) {
        let reallyIndex = (word: Word) => {
            if (this.wordsById[word.getId()]) {
                throw new Error('Multiple words with ID ' + word.getId() + '.');
            }
            
            this.wordsById[word.getId()] = word;

            let str = word.jp;

            if (!this.ambiguousForms[str]) {
                if (this.wordsByString[str]) {
                    let ambiguous = this.ambiguousForms[str]
                    
                    if (!ambiguous) {
                        ambiguous = []
                        this.ambiguousForms[str] = ambiguous
                    } 
                    
                    ambiguous.push(word)

                    delete this.wordsByString[str]
                }
                else {
                    this.wordsByString[str] = word;
                }
            }
        }
        
        reallyIndex(word)
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
            this.index(word), false
        )

        if (this.onAddInflectableWord) {
            this.onAddInflectableWord(word)
        }

        return this
    }

    changeInflection(word: InflectableWord, inflection: Inflection) {
        let wordByForm: { [s: string]: InflectedWord }  = {}

        word.visitAllInflections(
            (inflectedWord: InflectedWord) => {
                delete this.wordsByString[inflectedWord.jp]

                let existingInflection = this.wordsById[inflectedWord.getId()]

                if (existingInflection instanceof InflectedWord) {
                    wordByForm[inflectedWord.form] = existingInflection
                    delete this.wordsById[inflectedWord.getId()]
                }
                else {
                    throw new Error('Did not know about ' + inflectedWord.getId())
                }
            }, false)

        let oldId = word.getId();

        word.changeInflection(inflection)

        word.visitAllInflections(
            (inflectedWord: InflectedWord) => {
                this.wordsByString[inflectedWord.jp] = inflectedWord

                let existingInflection = wordByForm[inflectedWord.form]

                if (!existingInflection) {
                    throw new Error('New form ' + inflectedWord.form)
                }

                this.wordsById[inflectedWord.getId()] = existingInflection
            }, false)
        
        if (this.onChangeInflection) {
            this.onChangeInflection(word, oldId)
        }
    }
    
    get(id: string): Word {
        let result = this.wordsByString[id]
        
        if (result) {
            return result
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
       
    static fromJson(json, inflections) {
        let result = new Words();
        
        json.forEach((wordJson) => {
            if (wordJson.type == InflectableWord.getJsonType()) {
                result.addInflectableWord(InflectableWord.fromJson(wordJson, inflections))
            }
            else {
                result.addWord(InflectedWord.fromJson(wordJson, inflections))
            }
        })
        
        return result
    }
    
    toJson() {        
        let result = []
        
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
 
