
import Word from './Word'
import InflectedWord from './InflectedWord'
import Facts from './Facts'

export default class Words {
    wordsById : { [s: string]: Word } = {}
    
    ambiguousForms = {}
    
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
        
        return this
    }
    
    get(id: string) {
        let els = id.split('@')

        if (els.length == 2) {
            let word = this.get(els[0])
            
            if (word instanceof InflectedWord) {
                if (word.form != els[1]) {
                    return word.inflect(els[1])
                }
                else {
                    return word
                }
            }
            else {
                throw new Error(els[0] + ' does not inflect')
            }
        }
        else {    
            return this.wordsById[id]
        }        
    }
    
    static fromJson(json, inflections) {
        let result = new Words()
        
        json.forEach(result.add(Word.fromJson(json, inflections)))
        
        return result
    }
    
    toJson() {        
        let result = []
        
        for (let id in this.wordsById) {
            result.push(this.wordsById[id].toJson())    
        }
        
        return result
    }
}
 
