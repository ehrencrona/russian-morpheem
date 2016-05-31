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
    
    constructor(public words: Word[], public id: number, public author?: string) {
        this.words = words
        this.id = id
        this.author = author
    }
    
    static fromJson(json, facts, words) {
        let data = {
            id: json[0],
            words: json[1],
            english: json[2],
            requires: json[3]
        }

        if (data.english == 'undefined') {
            delete data.english
        }

        let sentence =
            new Sentence(
                data.words.map((wordId) => { 
                    let word = words.get(wordId)

                    if (!word) {
                        throw new Error(`Unknown word "${wordId}"`)
                    }

                    return word
                 }), data.id)
                .setEnglish(data.english)

        if (data.requires) {    
            data.requires.forEach((factId) => 
                sentence.requiresFact(facts.get(factId))
            )
        }

        return sentence        
    }
    
    toJson() {
        return [            
            this.id,
            this.words.map((word) => word.getId()),
            this.english,
            ( this.required ? this.required.map((fact) => fact.getId()) : undefined )
        ]
    }

    getId(): number {
        if (this.id === undefined) {
            throw new Error('No ID present.')
        }

        return this.id
    }

    setEnglish(en) {
        if (en !== 'undefined') {
            this.english = en
        }
        
        return this
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
