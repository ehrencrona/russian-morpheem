"use strict";

import Word from './Word'
import Inflection from './inflection/Inflection'
import Inflections from './inflection/Inflections'
import { FORMS, Tense, Number } from './inflection/InflectionForms' 
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

    setEnglish(en: string, form?: string) {
        if (form) {
            this.word.setEnglish(form)
        }
        else {
            throw new Error('Cant set English translation on inflected word without specifying form')
        }

        return this
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
            let disambiguation

            homonyms = homonyms.filter((other) => other !== this)

            if (!homonyms.find((otherWord) => otherWord.getEnglish() == this.getEnglish())) {
                disambiguation = this.getEnglish()
            }
            else if (!homonyms.find((otherWord) => otherWord.classifier == this.classifier)) {
                disambiguation = this.classifier
            }
            else if (!homonyms.find((otherWord) => (otherWord instanceof InflectedWord) && 
                    otherWord.form == this.form)) {
                disambiguation = this.form
            }
            else {
                let defaultInflection = this.word.getDefaultInflection().jp

                if (!homonyms.find((otherWord) => (otherWord instanceof InflectedWord) && 
                    otherWord.word.getDefaultInflection().jp == defaultInflection)) {
                    disambiguation = defaultInflection
                } 
                else if (!homonyms.find((otherWord) => (otherWord instanceof InflectedWord) && 
                    otherWord.word.getEnglish() == this.getEnglish() && 
                    otherWord.form == this.form)) {
                    disambiguation = this.form + ', ' + this.getEnglish()
                }
                else {
                    console.warn(this + ' is ambiguous no matter what.', this.getId(), homonyms.map((w) => w.getId()))

                    disambiguation = this.form + (this.classifier ? ', ' + this.classifier : '') 
                }
            }

            return disambiguation
        }
    } 

    hasMyStem(word: Word | InflectableWord) {
        return this.word.hasMyStem(word)
    }

    getDefaultInflection() {
        return this.word.getDefaultInflection()
    }

    getId() {
        return this.word.getId() + '@' + this.form
    }

    getEnglish(form?) {
        if (!form) {
            if (this.pos == 'v') {
                if (this.form == '3') {
                    form = '3' 
                }
                else if (FORMS[this.form].tense == Tense.PAST) {
                    form = 'past'
                }
            }
            else if (this.pos == 'adj') {
                if (this.form == 'comp') {
                    form = 'comp'
                }
            }
            else if (this.pos == 'n') {
                if (FORMS[this.form].number == Number.PLURAL) {
                    form = 'past'
                }
            }

            console.log('got form ' + form + ' for ' + this.form + ' in pos ' + this.pos)
        }

        var result = this.en[form || '']

        if (!result) {
            result = this.word.getEnglish()
        }

        return result
    }
}