import Phrase from './Phrase';

import { JsonFormat as PhraseJsonFormat } from './Phrase'
import Words from '../Words'

export type JsonFormat = PhraseJsonFormat[]

export default class Phrases {
    phraseById : { [s: string]: Phrase } = {}

    constructor() {
        this.phraseById = {};
    }

    add(phrase: Phrase) {
        this.phraseById[phrase.getId()] = phrase

        return this
    }

    get(id) {
        return this.phraseById[id];
    }

    static fromJson(json, words: Words): Phrases {
        let result = new Phrases();

        (json as JsonFormat).forEach((phraseJson: PhraseJsonFormat) => 
            result.add(Phrase.fromJson(phraseJson, words)))

        return result
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
