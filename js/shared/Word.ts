"use strict";

import UnstudiedWord from './UnstudiedWord';

/**
 * A word has a Japanese spelling, an English translation an optional list of grammar that is required to understand it.
 */
export default class Word extends UnstudiedWord {
    visitFacts(visitor) {
        visitor(this)

        this.visitRequired(visitor)
    }

    getId() {
        return this.jp + (this.classifier ? '[' + this.classifier + ']' : '')
    }

    getJsonType() {
        return 'word'
    }
}
