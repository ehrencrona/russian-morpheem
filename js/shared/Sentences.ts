
import Sentence from './Sentence';
import Facts from './fact/Facts';
import Words from './Words';

export default class Sentences {
    sentenceById : { [id: number]: Sentence } = {}
    sentences : Sentence[] = []

    onAdd: (sentence: Sentence) => void = null
    onChange: (sentence: Sentence) => void = null
    onDelete: (sentence: Sentence) => void = null
    
    nextSentenceId: number = 0

    constructor() {
    }

    clone(sentences: Sentences) {
        this.sentenceById = sentences.sentenceById
        this.sentences = sentences.sentences
    }

    get(id: number) {
        let sentence = this.sentenceById[id]
        
        return sentence;
    }

    remove(sentence: Sentence) {
        if (!this.sentenceById[sentence.id]) {
            throw new Error(`Unknown sentence ${ sentence.id }`)
        }
        
        delete this.sentenceById[sentence.id]
        
        this.sentences = this.sentences.filter((storedSentence) =>
            storedSentence.getId() != sentence.getId())

        if (this.onDelete) {
            this.onDelete(sentence)
        }
    }

    add(sentence: Sentence) {
        if (sentence.id == undefined) {
            sentence.id = this.nextSentenceId++
        }

        if (this.sentenceById[sentence.getId()]) {
            throw new Error(`Duplicate sentence ${ sentence.getId() }`)
        }

        this.sentences.push(sentence)
        this.sentenceById[sentence.getId()] = sentence

        if (sentence.getId() >= this.nextSentenceId) {
            this.nextSentenceId = sentence.getId() + 1
        }

        if (this.onAdd) {
            this.onAdd(sentence)
        }
        
        return Promise.resolve(sentence)
    }

    store(sentence: Sentence) {
        let storedSentence = this.sentenceById[sentence.getId()] 

        if (!storedSentence) {
            throw new Error('Unknown sentence "' + sentence.getId() + '"')
        }

        sentence.author = storedSentence.author

        if (!sentence.en && storedSentence.en) {
            sentence.en = storedSentence.en
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

    fromJson(json, facts: Facts, words: Words) {
        json.forEach((sentenceJson) => {
            this.add(Sentence.fromJson(sentenceJson, facts, words))
        })

        return this
    }
    
    toJson() {
        return this.sentences.map((sentence) => sentence.toJson())
    }
}