"use strict";

import Fact from './fact/Fact';
import Inflections from './inflection/Inflections'
import Words from './Words'

export interface JsonFormat {
    target: string,
    en: string,
    classifier: string,
    type: string    
}

/**
 * A word has a Japanese spelling, an English translation an optional list of grammar that is required to understand it.
 */
export default class Word {
    en: any
    required: Fact[]

    constructor(public jp: string, public classifier?: string) {
        this.jp = jp
        this.classifier = classifier
        this.en = { }
    }

    related(fact) {
        // unused for now

        return this
    }

    requiresFact(fact) {
        if (!fact) {
            throw new Error('No fact.')
        }

        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    }

    visitRequired(visitor) {
        if (this.required) {
            for (let fact of this.required) {
                if (fact.visitFacts) {
                    fact.visitFacts(visitor)
                }
                else {
                    visitor(fact)
                }
            }
        }
    }

    getEnglish(form?) {
        if (!form) {
            form = ''
        }

        var result = this.en[form]

        if (!result) {
            if (form == '') {
                return ''
            }
            
            throw new Error('Form ' + form + ' not present among English translations of "' + this + '", only ' + Object.keys(this.en))
        }

        return result
    }

    setEnglish(en, form?) {
        if (!form) {
            form = ''
        }

        this.en[form] = en

        return this
    }

    toString() {
        return this.jp
    }
        
    toJson(): JsonFormat {
        return {
            target: this.jp,
            en: this.en[''],
            classifier: this.classifier,
            type: this.getJsonType()
        }
    }
    
    toUnambiguousString(words: Words) {
        let disambiguation = this.getDisambiguation(words)

        return this.jp + (disambiguation ? 
            ' [' + disambiguation + ']' : '')
    }

    getDisambiguation(words: Words) {
        let homonyms = words.ambiguousForms[this.jp]

        if (homonyms) {
            let form

            homonyms = homonyms.filter((other) => other !== this)

            if (!homonyms.find((otherWord) => otherWord.classifier == this.classifier)) {
                form = this.classifier
            }
            else {
                form = (this.classifier ? this.classifier : 'uninfl.')
            }

            return form
        }
    } 

    toText() {
        return this.jp
    }
    
    visitFacts(visitor) {
        visitor(this)

        this.visitRequired(visitor)
    }

    static fromJson(json: JsonFormat, inflections: Inflections): Word {
        return new Word(json.target, json.classifier).setEnglish(json.en)
    }

    getId() {
        return this.jp + (this.classifier ? '[' + this.classifier + ']' : '')
    }

    getJsonType() {
        return 'word'
    }
}
