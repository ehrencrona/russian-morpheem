import Phrase from './Phrase';

import { JsonFormat as PhraseJsonFormat } from './Phrase'
import Words from '../Words'
import Corpus from '../Corpus'
import Inflections from '../inflection/Inflections'
import PhrasePattern from './PhrasePattern'

export type JsonFormat = PhraseJsonFormat[]

export default class Phrases {
    phraseById : { [s: string]: Phrase } = {}

    corpus: Corpus
    onChange: (phrase: Phrase) => void

    constructor() {
        this.phraseById = {};
    }

    clone(phrases: Phrases) {
        this.phraseById = phrases.phraseById
        this.corpus = phrases.corpus
    }

    add(phrase: Phrase) {
        this.phraseById[phrase.getId()] = phrase

        if (this.corpus) {
            phrase.setCorpus(this.corpus)
        }

        return this
    }

    remove(phrase: Phrase) {
        delete this.phraseById[phrase.getId()]

        if (this.onChange) {
            this.onChange(phrase)
        }
    }

    store(phrase: Phrase) {
        this.phraseById[phrase.getId()] = phrase

        if (this.onChange) {
            this.onChange(phrase)
        }
    }

    setDescription(phrase: Phrase, description: string) {
        phrase.description = description

        if (this.onChange) {
            this.onChange(phrase)
        }
    }

    setEnglish(phrase: Phrase, pattern: PhrasePattern, en: string) {
        pattern.setEnglish(en)

        if (this.onChange) {
            this.onChange(phrase)
        }
    }

    setPattern(phrase: Phrase, patterns: PhrasePattern[]) {
        patterns.forEach((pattern) => pattern.setCorpus(this.corpus))

        phrase.patterns = patterns

        if (this.onChange) {
            this.onChange(phrase)
        }
    }

    get(id) {
        return this.phraseById[id];
    }

    static fromJson(json, words: Words, inflections: Inflections): Phrases {
        let result = new Phrases();

        (json as JsonFormat).forEach((phraseJson: PhraseJsonFormat) => 
            result.add(Phrase.fromJson(phraseJson, words, inflections)))

        return result
    }

    setCorpus(corpus: Corpus) {
        this.corpus = corpus

        this.all().forEach((phrase) => phrase.setCorpus(corpus))
    }

    all(): Phrase[] {
        return Object.keys(this.phraseById).map((id) => 
            this.phraseById[id])
    }

    toJson(): JsonFormat {
        return this.all().map((p) => 
            p.toJson()
        )
    }
}
