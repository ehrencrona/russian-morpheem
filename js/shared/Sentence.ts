"use strict";

import Word from './Word'
import Fact from './fact/Fact'
import Words from './Words'
import Facts from './fact/Facts'
import UnstudiedWord from './UnstudiedWord'
import InflectedWord from './InflectedWord'
import htmlEscape from './util/htmlEscape'

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

    static fromJson(json, facts: Facts, words: Words) {
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

    innerToString(wordToString: (word: UnstudiedWord, first: boolean) => string) {
        let res = ''
        let capitalize = true 

        for (let word of this.words) {
            if (res.length && (word.jp.length > 1 || Words.PUNCTUATION.indexOf(word.jp) < 0)) {
                res += ' '
            }

            let wordString = wordToString(word, res.length == 0)

            if (capitalize) {
                wordString = wordString[0].toUpperCase() + wordString.substr(1)
            }

            res += wordString

            capitalize = Words.SENTENCE_ENDINGS.indexOf(word.jp) >= 0
        }

        if (this.words.length && Words.PUNCTUATION.indexOf(this.words[this.words.length-1].jp) < 0) {
            res += '.'
        }

        return res
    }

    toString() {
        return this.innerToString((word) => word.toString())
    }

    toUnambiguousHtml(words: Words) {
        return this.innerToString((word, first) => {
            if (word.jp == '—' && !first) {
                return '<br>—'
            }

            let result

            if (word instanceof InflectedWord) {
                result = word.toUnambiguousHtml(words)                
            }
            else {
                result = htmlEscape(word.toString())
            }

            return result
        })
    }

    toUnambiguousString(words: Words) {
        return this.innerToString((word) => {
            if (word instanceof InflectedWord) {
                return word.toUnambiguousString(words)                
            }
            else {
                return word.toString()
            }
        })
    }
}
