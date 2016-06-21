"use strict";

import Word from './Word'
import UnstudiedWord from './UnstudiedWord'
import Inflection from './Inflection'
import Inflections from './Inflections'
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
        return this.jp + (words.ambiguousForms[this.jp] ? 
            ' [' + (this.classifier || this.form) + ']' : '')
    }

    toUnambiguousHtml(words: Words) {
        return htmlEscape(this.jp) + (words.ambiguousForms[this.jp] ? 
            ' <span class="form">' + (this.classifier || this.form) + '</span>' : '')
    }

    getDefaultInflection() {
        return this.word.getDefaultInflection()
    }

    getId() {
        return this.word.getId() + '@' + this.form
    }
}