"use strict";

import UnstudiedWord from './UnstudiedWord';
import Inflections from './Inflections'

/**
 * A word has a Japanese spelling, an English translation an optional list of grammar that is required to understand it.
 */
export default class Word extends UnstudiedWord {
    visitFacts(visitor) {
        visitor(this)

        this.visitRequired(visitor)
    }

    static fromJson(json, inflections: Inflections): UnstudiedWord {
        if (json.type == 'word') {
            return new Word(json.target, json.classifier).setEnglish(json.en)
        }
        else {
            return super.fromJson(json, inflections)
        }
    }

    getId() {
        return this.jp + (this.classifier ? '[' + this.classifier + ']' : '')
    }

    getJsonType() {
        return 'word'
    }
}
