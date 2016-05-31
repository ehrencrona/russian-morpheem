import Facts from '../shared/Facts';
import Words from '../shared/Words';
import Sentences from '../shared/Sentences';
import Inflections from '../shared/Inflections';

export default class Corpus {
    onChangeOnDisk: () => any
    
    static createEmpty(lang: string) {
        let facts = new Facts()
        
        return new Corpus(
            new Inflections([]),
            new Words(facts),
            new Sentences(),
            facts,
            lang
        )
    }
    
    constructor(
        public inflections: Inflections, public words: Words, 
        public sentences: Sentences, public facts: Facts, public lang: string) {
        this.inflections = inflections
        this.words = words
        this.sentences = sentences
        this.facts = facts
    }

    static fromJson(json): Corpus {
        let inflections = Inflections.fromJson(json.inflections)
        let words = Words.fromJson(json.words, inflections) 
        let facts = Facts.fromJson(json.facts, inflections, words)
        let sentences = Sentences.fromJson(json.sentences, facts, words)
        
        return new Corpus(
            inflections,
            words,
            sentences,
            facts, 
            json.lang)
    }

    clone(otherCorpus: Corpus) {
        this.words.clone(otherCorpus.words)
        this.facts.clone(otherCorpus.facts)
        this.inflections.clone(otherCorpus.inflections)
        this.sentences.clone(otherCorpus.sentences)
    }

    toJson() {
        return {
            sentences: this.sentences.toJson(),
            inflections: this.inflections.toJson(),
            facts: this.facts.toJson(),
            words: this.words.toJson(),
            lang: this.lang
        }
    }
}