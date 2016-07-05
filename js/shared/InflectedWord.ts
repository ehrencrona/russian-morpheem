"use strict";

import Word from './Word'
import UnstudiedWord from './UnstudiedWord'
import Inflection from './inflection/Inflection'
import Inflections from './inflection/Inflections'
import InflectableWord from './InflectableWord'
import Words from './Words'
import htmlEscape from './util/htmlEscape'

export default class InflectedWord extends Word {
    /**
     * @param infinitive Word representing the base form. null if this IS the infinitive.
     */
    constructor(public jp: string, public form: string, public word : InflectableWord) {
        super(jp, '');

        this.form = form
        this.word = word
    }

    /**
     * The knowledge required for an inflection is the base form of the word as well as any gramar rules used to
     * derive it.
     */
    visitFacts(visitor: (Fact) => any) {
        this.visitRequired(visitor)

        visitor(this.word.inflection.getFact(this.form))

        this.word.visitFacts(visitor)
    }

    toUnambiguousString(words: Words) {
        let disambiguation = this.getDisambiguation(words)

        return this.jp + (disambiguation ? ' [' + disambiguation + ']' : '')
    }

    toUnambiguousHtml(words: Words) {
        return htmlEscape(this.jp) + (words.ambiguousForms[this.jp] ? 
            ' <span class="form">' + (this.classifier || this.form) + '</span>' : '')
    }

    getDisambiguation(words: Words) {
        let homonyms = words.ambiguousForms[this.jp]

        if (homonyms) {
            let form

            if (!homonyms.find((otherWord) => otherWord.classifier == this.classifier)) {
                form = this.classifier
            }
            else {
                if (!homonyms.find((otherWord) => (otherWord instanceof InflectedWord) && otherWord.form == this.form)) {
                    form = this.form
                }
                else {
                    form = this.form + (this.classifier ? ', ' + this.classifier : '') 
                }
            }

            return form
        }
    } 

    getDefaultInflection() {
        return this.word.getDefaultInflection()
    }

    getId() {
        return this.word.getId() + '@' + this.form
    }
}