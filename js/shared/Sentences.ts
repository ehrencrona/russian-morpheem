import { Match } from './phrase/Match';
import { DebugPosition } from './phrase/MatchContext';

import Sentence from './Sentence';
import Facts from './fact/Facts';
import Phrase from './phrase/Phrase'
import Phrases from './phrase/Phrases'
import Words from './Words';
import { SentencesByFactIndex, indexSentencesByFact } from './SentencesByFactIndex'

import { JsonFormat as SentenceJsonFormat } from './Sentence'

export type JsonFormat = SentenceJsonFormat[] 

export default class Sentences {
    sentenceById : { [id: number]: Sentence } = {}
    sentences : Sentence[] = []

    onAdd: (sentence: Sentence) => void = null
    onChange: (sentence: Sentence) => void = null
    onDelete: (sentence: Sentence) => void = null
    
    nextSentenceId: number = 0

    sentencesByFact : SentencesByFactIndex

    phraseMatchCache = new Map<string, Match>()

    constructor() {
    }

    getSentencesByFact(facts: Facts): SentencesByFactIndex {
        if (!this.sentencesByFact) {
            this.sentencesByFact = indexSentencesByFact(this, facts)
        }

        return this.sentencesByFact || {}
    }

    clone(sentences: Sentences) {
        this.sentenceById = sentences.sentenceById
        this.sentences = sentences.sentences
    }

    get(id: number) {
        let sentence = this.sentenceById[id]
        
        return sentence;
    }

    addPhrase(phrase: Phrase, sentence: Sentence) {
        sentence.addPhrase(phrase)

        this.sentencesByFact = null

        this.fireOnChange(sentence)
    }

    removePhrase(phrase: Phrase, sentence: Sentence) {
        sentence.removePhrase(phrase)

        this.sentencesByFact = null

        this.fireOnChange(sentence)
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

        this.sentencesByFact = null

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
        
        this.fireOnChange(sentence)
    }

    phraseChanged(phrase: Phrase) {
        this.phraseMatchCache.clear()
    }

    fireOnChange(sentence) {
        this.phraseMatchCache.clear()

        if (this.onChange) {
            this.onChange(sentence) 
        }
    }

    fromJson(json: JsonFormat, phrases: Phrases, words: Words) {
        json.forEach((sentenceJson) => {
            this.add(Sentence.fromJson(sentenceJson, phrases, words))
        })

        return this
    }

    match(sentence: Sentence, phrase: Phrase, facts: Facts, debug?: 
            (message: string, position: DebugPosition) => void): Match {
        let cacheKey = sentence.id + phrase.id
        
        let result = this.phraseMatchCache.get(cacheKey)

        if (result === undefined) {
            result = phrase.match({ facts: facts, sentence: sentence, words: sentence.words, debug: debug })

            this.phraseMatchCache.set(cacheKey, result)

            misses++
        }
        else {
            hits++

            if (hits % 10000 == 0) {
                console.log(Math.round(hits / (hits+misses) * 100) + '% hit ratio in phrase cache')
            }
        }

        return result
    }

    toJson(): JsonFormat {
        return this.sentences.map((sentence) => sentence.toJson())
    }
}

let hits = 0
let misses = 0