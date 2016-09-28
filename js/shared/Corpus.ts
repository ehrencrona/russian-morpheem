import Facts from '../shared/fact/Facts'
import Words from '../shared/Words'
import { Factoids } from '../shared/metadata/Factoids'
import Sentences from '../shared/Sentences'
import Phrases from '../shared/phrase/Phrases'
import Inflections from '../shared/inflection/Inflections'
import { SentenceHistory } from '../shared/metadata/SentenceHistory'
import { PhraseHistory } from '../shared/metadata/PhraseHistory'
import { ExternalCorpus } from '../shared/external/ExternalCorpus'

import { JsonFormat as FactsJsonFormat } from '../shared/fact/Facts'
import { JsonFormat as PhraseJsonFormat } from '../shared/phrase/Phrases'
import { JsonFormat as WordsJsonFormat } from '../shared/Words'
import { JsonFormat as InflectionsJsonFormat } from '../shared/inflection/Inflections'
import { JsonFormat as SentencesJsonFormat } from '../shared/Sentences'

export interface JsonFormat {
    sentences: SentencesJsonFormat,
    inflections: InflectionsJsonFormat,
    facts: FactsJsonFormat,
    words: WordsJsonFormat,
    phrases: PhraseJsonFormat,
    lang: string
}

export default class Corpus {
    onChangeOnDisk: () => any
    sentenceHistory: SentenceHistory
    phraseHistory: PhraseHistory
    externalCorpus: ExternalCorpus
    factoids: Factoids
    
    static createEmpty(lang: string) {
        let facts = new Facts()
        
        let result = new Corpus(
            new Inflections([]),
            new Words(facts),
            new Sentences(),
            facts,
            new Phrases(),
            lang
        )

        result.phrases.setCorpus(result)

        return result
    }
    
    constructor(
        public inflections: Inflections, public words: Words, 
        public sentences: Sentences, public facts: Facts, public phrases: Phrases, public lang: string) {
        this.phrases = phrases
        this.inflections = inflections
        this.words = words
        this.sentences = sentences
        this.facts = facts
        this.lang = lang
    }

    static fromJson(json): Corpus {
        let inflections = new Inflections().fromJson(json.inflections)
        let words = Words.fromJson(json.words, inflections)
        let phrases = Phrases.fromJson(json.phrases, words, inflections) 
        let facts = Facts.fromJson(json.facts, inflections, words, phrases)
        let sentences = new Sentences()

        sentences.fromJson(json.sentences, phrases, words)

        let corpus = new Corpus(
            inflections,
            words,
            sentences,
            facts,
            phrases, 
            json.lang)

        phrases.setCorpus(corpus)
        return corpus
    }

    clone(otherCorpus: Corpus) {
        this.words.clone(otherCorpus.words)
        this.facts.clone(otherCorpus.facts)
        this.inflections.clone(otherCorpus.inflections)
        this.sentences.clone(otherCorpus.sentences)
        this.phrases.clone(otherCorpus.phrases)
        this.sentenceHistory = otherCorpus.sentenceHistory
        this.phraseHistory = otherCorpus.phraseHistory
        this.externalCorpus = otherCorpus.externalCorpus
        this.factoids = otherCorpus.factoids
        this.lang = otherCorpus.lang
    }

    toJson() {
        return {
            sentences: this.sentences.toJson(),
            inflections: this.inflections.toJson(),
            facts: this.facts.toJson(),
            words: this.words.toJson(),
            phrases: this.phrases.toJson(),
            lang: this.lang
        }
    }
}