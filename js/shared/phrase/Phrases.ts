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

        this.phraseChanged(phrase, true)
    }

    store(phrase: Phrase) {
        this.phraseById[phrase.getId()] = phrase

        this.phraseChanged(phrase, true)
    }

    setDescription(phrase: Phrase, description: string) {
        phrase.description = description

        this.phraseChanged(phrase, false)
    }

    setPhraseEnglish(phrase: Phrase, en: string) {
        phrase.en = en

        this.phraseChanged(phrase, false)
    }

    phraseChanged(phrase: Phrase, structurally: boolean) {
        if (this.onChange) {
            this.onChange(phrase)
        }
    }

    setPatternEnglish(phrase: Phrase, pattern: PhrasePattern, en: string) {
        pattern.setEnglish(en)

        this.phraseChanged(phrase, true)
    }

    setPattern(phrase: Phrase, patterns: PhrasePattern[]) {
        patterns.forEach((pattern) => pattern.setCorpus(this.corpus))

        phrase.patterns = patterns

        this.phraseChanged(phrase, true)
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
