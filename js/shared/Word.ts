"use strict";

import Fact from './fact/Fact';
import Inflections from './inflection/Inflections'
import Words from './Words'
import InflectableWord from './InflectableWord'
import AbstractAnyWord from './AbstractAnyWord'

export interface JsonFormat {
    target: string,
    en: { [ form: string ]: string },
    classifier: string,
    type: string,
    unstudied?: boolean,
    pos?: string
}

/**
 * A word has a Japanese spelling, an English translation an optional list of grammar that is required to understand it.
 */
export default class Word extends AbstractAnyWord {
    required: Fact[]

    constructor(public jp: string, public classifier?: string) {
        super()

        this.jp = jp
        this.classifier = classifier
        this.en = { }
    }

    related(fact) {
        // unused for now

        return this
    }

    getWordFact(): Fact {
        let omitted = this.omitted

        if (omitted instanceof Word) {
            return omitted
        }
        else {
            return this
        }
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

    toString() {
        return this.jp
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

            if (!homonyms.find((otherWord) => otherWord.getEnglish() == this.getEnglish())) {
                form = this.getEnglish()
            }
            else if (!homonyms.find((otherWord) => otherWord.classifier == this.classifier)) {
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
        if (this.studied) {
            visitor(this.getWordFact())
        }

        this.visitRequired(visitor)
    }

    static fromJson(json: JsonFormat, inflections: Inflections): Word {
        let result = new Word(json.target, json.classifier)
        
        result.en = json.en

        result.calculateEnCount()

        if (json.unstudied) {
            result.studied = false
        }

        result.pos = json.pos

        return result
    }

    toJson(): JsonFormat {
        let result: JsonFormat = {
            target: this.jp,
            en: this.en,
            classifier: this.classifier,
            type: this.getJsonType(),
            pos: this.pos
        }

        if (!this.studied) {
            result.unstudied = true
        }

        return result
    }

    hasMyStem(word: Word | InflectableWord): boolean {
        return word.getId() == this.getId()
    }

    getIdWithoutClassifier() {
        return this.jp
    }

    getId() {
        return this.jp 
            + (this.classifier ? '[' + this.classifier + ']' : '') 
            + (this.omitted ? '*' : '')
    }

    getJsonType() {
        return 'word'
    }
}
