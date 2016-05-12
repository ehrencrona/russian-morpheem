
import Word from './Word'
import InflectedWord from './InflectedWord'
import Facts from './Facts'

export default class Words {
    wordsById : { [s: string]: Word } = {}
    inflectionsByDefaultForm : { [s: string]: InflectedWord } = {}
    
    ambiguousForms = {}

    onAdd: (word: Word) => void = null

    constructor(facts?: Facts) {
        if (facts) {
            for (let fact of facts.facts) {
                if ((fact instanceof Word)) {
                    this.add(fact);
                }
            }
        }
    }
    
    add(word: Word) {
        if (word instanceof InflectedWord) {
            this.inflectionsByDefaultForm[word.infinitive.toString()] = word

            word.visitAllInflections(
                (inflectedWord) => {
                    let str = inflectedWord.toString();

                    if (!this.ambiguousForms[str]) {
                        if (this.wordsById[str]) {
                            this.ambiguousForms[str] = true
                            delete this.wordsById[str]
                        }
                        else {
                            this.wordsById[str] = inflectedWord;
                        }
                    }

                    let formString = inflectedWord.toFormString(true)
                    
                    if (this.wordsById[formString]) {
                        throw new Error('Duplicate word ' + word + '.');
                    }

                    this.wordsById[formString] = inflectedWord;                     
                    this.wordsById[inflectedWord.toFormString(false)] = inflectedWord; 
                }, false)
        }
        else {
            if (this.wordsById[word.toString()]) {
                throw new Error('Duplicate word ' + word + '.');
            }

            this.wordsById[word.toString()] = word
        }
                
        if (this.onAdd) {
            this.onAdd(word)
        }

        return this
    }
    
    get(id: string): Word {
        let result = this.wordsById[id]
        
        if (result) {
            return result
        }

        let els = id.split('@')

        if (els.length == 2) {
            let word = this.inflectionsByDefaultForm[els[0]]

            if (!word) {
                let w = this.wordsById[els[0]]

                if (!w) {
                    return                     
                }
                else if (w instanceof InflectedWord) {
                    word = w
                }
                else {
                    throw new Error(`"${els[0]}" is not an inflected word.`)                    
                }
            }
            
            if (word.form != els[1]) {
                return word.inflect(els[1])
            }
            else {
                return word
            }
        }
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
 
