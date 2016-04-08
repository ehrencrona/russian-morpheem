"use strict";

import Word from './Word';
import Fact from './Fact';
import UnstudiedWord from './UnstudiedWord';

/**
 * A sentence is a list of Japanese words with an English translation. It can optionally require certain grammar facts.
 */
export default class Sentence {
    english: string
    required: Fact[]
    
    constructor(public words: Word[], public id: string) {
        this.words = words
        this.id = id
    }
    
    toJson() {
        return {
            words: this.words.map((word) => word.getId()),
            english: this.english,
            requires: ( this.required ? this.required.map((fact) => fact.getId()) : undefined )
        }
    }

    getId() {
        if (this.id === undefined) {
            throw new Error('No ID present.')
        }

        return this.id
    }

    setEnglish(en) {
        this.english = en
    }

    en() {
        return this.english
    }

    jp() {
        var res = ''

        for (let word of this.words) {
            res += word.jp + ' '
        }

        return res
    }

    requiresFact(fact: Fact) {
        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    }

    visitFacts(visitor: (Fact) => any) {
        for (let word of this.words) {
            word.visitFacts(visitor)
        }

        if (this.required) {
            for (let fact of this.required) {
                fact.visitFacts(visitor)
            }
        }
    }

    toString() {
        var res = ''

        for (let word of this.words) {
            res += word.toString() + ' '
        }

        return res
    }
}
