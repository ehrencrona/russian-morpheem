
import Sentence from './Sentence';
import Facts from './Facts';
import Words from './Words';

export default class Sentences {
    sentenceById : { [id: string]: Sentence } = {}
    sentences : Sentence[] = []

    onAdd: (sentence: Sentence) => void = null
    onChange: (sentence: Sentence) => void = null

    constructor() {
    }

    add(sentence: Sentence) {
        if (this.sentenceById[sentence.getId()]) {
            throw new Error(`Duplicate sentence ${ sentence.getId() }`)
        }
        
        this.sentences.push(sentence)
        this.sentenceById[sentence.getId()] = sentence
        
        if (this.onAdd) {
            this.onAdd(sentence)
        }
        
        return this
    }

    store(sentence: Sentence) {
        if (!this.sentenceById[sentence.getId()]) {
            throw new Error('Unknown sentence')
        }

        this.sentenceById[sentence.getId()] = sentence

        this.sentences.find((storedSentence, index) => {
            if (storedSentence.getId() == sentence.getId()) {
                this.sentences[index] = sentence

                return true
            }
        })
        
        if (this.onChange) {
            this.onChange(sentence)
        }
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