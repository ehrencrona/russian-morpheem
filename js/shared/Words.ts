
import Word from './Word'
import InflectedWord from './InflectedWord'
import InflectableWord from './InflectableWord'
import Inflection from './Inflection'
import Facts from './Facts'
import UnstudiedWord from './UnstudiedWord';

export default class Words {
    wordsByString : { [s: string]: Word } = {}
    wordsById : { [s: string]: Word } = {}
    
    ambiguousForms = {}

    onAddWord: (word: Word) => void = null
    onAddInflectableWord: (word: InflectableWord) => void = null
    onChangeInflection: (word: InflectableWord) => void = null

    static PUNCTUATION = '.?!,;"'

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
    
    addPunctuation() {
        for (let i = 0; i < Words.PUNCTUATION.length; i++) {
            this.addWord(new UnstudiedWord(Words.PUNCTUATION[i], null))
        }
    }

    index(word: Word) {
        let reallyIndex = (word: Word) => {
            if (this.wordsById[word.getId()]) {
                throw new Error('Duplicate word ' + word + '.');
            }
            
            this.wordsById[word.getId()] = word;

            let str = word.jp;

            if (!this.ambiguousForms[str]) {
                if (this.wordsByString[str]) {
                    this.ambiguousForms[str] = true
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
            this.onChangeInflection(word)
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
        
        json.forEach((wordJson) => 
            result.add(InflectedWord.fromJson(wordJson, inflections)))
        
        return result
    }
    
    toJson() {        
        let result = []
        
        for (let id in this.wordsById) {
            let word = this.wordsById[id]
            
            if (word instanceof InflectedWord) {
                if (word.inflection.defaultForm !== word.form || id.indexOf('@') < 0) {
                    continue
                }
            }
            
            result.push(word.toJson())    
        }
        
        return result
    }
}
 
