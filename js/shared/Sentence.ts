"use strict";

import Word from './Word'
import Fact from './Fact'
import Words from './Words'
import UnstudiedWord from './UnstudiedWord'
import InflectedWord from './InflectedWord'

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
            requires: json[3],
            tags: json[4]
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

    capitalizeAndEndWithDot(sentence) {
        if (sentence.length) {
            if (Words.PUNCTUATION.indexOf(sentence[sentence.length-1]) < 0) {
                sentence += '.'
            }

            sentence = sentence[0].toUpperCase() + sentence.substr(1)
        }

        return sentence
    }

    toString(old?: boolean) {
        var res = ''

        for (let word of this.words) {
            if (res.length && (word.jp.length > 1 || Words.PUNCTUATION.indexOf(word.jp) < 0)) {
                res += ' '
            }

            res += word.toString()
        }

        if (old)

        return res
        
        return this.capitalizeAndEndWithDot(res)
    }

    toUnambiguousString(words: Words) {
        var res = ''

        for (let word of this.words) {
            if (res.length && (word.jp.length > 1 || Words.PUNCTUATION_NOT_PRECEDED_BY_SPACE.indexOf(word.jp) < 0)) {
                res += ' '
            }

            if (word instanceof InflectedWord) {
                res += word.toUnambiguousString(words)                
            }
            else {
                res += word.toString()
            }
        }

        return this.capitalizeAndEndWithDot(res)
    }
}
