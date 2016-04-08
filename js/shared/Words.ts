
import Word from './Word'
import InflectedWord from './InflectedWord'
import Facts from './Facts'

export default class Words {
    wordsById : { [s: string]: Word } = {}
    
    constructor(facts: Facts) {
        let ambiguousForms = {}

        for (let fact of facts.facts) {
            if ((fact instanceof Word)) {
                let word: Word = fact;
                
                if (word instanceof InflectedWord) {
                    word.visitAllInflections(
                        (inflectedWord) => {
                            let str = inflectedWord.toString();

                            if (!ambiguousForms[str]) {
                                if (this.wordsById[str]) {
                                    ambiguousForms[str] = true
                                    delete this.wordsById[str]
                                }
                                else {
                                    this.wordsById[str] = inflectedWord;
                                }
                            }

                            this.wordsById[inflectedWord.toFormString(true)] = inflectedWord; 
                            this.wordsById[inflectedWord.toFormString(false)] = inflectedWord; 
                        }, false)
                }
                else {
                    if (this.wordsById[word.toString()]) {
                        throw new Error('Duplicate word ' + word + '.');
                    }

                    this.add(word);
                }
            }
        }
    }
    
    add(word: Word) {
        this.wordsById[word.toString()] = word
    }
    
    get(id: string) {
        return this.wordsById[id]
    }
    
    toJson() {        
        let result = []
        
        for (let id in this.wordsById) {
            result.push(this.wordsById[id].toJson())    
        }
        
        return result
    }
}
 
