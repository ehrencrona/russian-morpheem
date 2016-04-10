
import Sentence from './Sentence';
import Facts from './Facts';
import Words from './Words';

export default class Sentences {
    sentences : Sentence[] = []

    constructor() {
    }

    add(sentence: Sentence) {
        this.sentences.push(sentence)
        
        return this
    }

    static fromJson(json, facts: Facts, words: Words) {
        let sentences = new Sentences()
        
        json.forEach((sentenceJson) => {
            sentences.add(Sentence.fromJson(sentenceJson, facts, words))
        })
        
        return sentences
    }
    
    toJson() {
        return this.sentences.map((sentence) => sentence.toJson())
    }
}