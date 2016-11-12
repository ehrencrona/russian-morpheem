import Word from './Word'
import Inflection from './inflection/Inflection'
import Inflections from './inflection/Inflections'
import { FORMS, PartOfSpeech, Tense, Number, Comparison, GrammaticalCase } from './inflection/InflectionForms' 
import InflectableWord from './InflectableWord'
import Words from './Words'
import Fact from './fact/Fact'
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

    setEnglish(en: string, form?: string, translationIndex?: number) {
        if (form) {
            this.word.setEnglish(en, form, translationIndex)
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

        this.word.inflection.getFact(this.form).visitFacts(visitor)

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

            homonyms = homonyms.filter((other) => other !== this && other != this.omitted)

            if (!homonyms.find((otherWord) => otherWord.getWordFact().getId() != this.getWordFact().getId())) {
                disambiguation = this.form
            }
            else if (!homonyms.find((otherWord) => !(otherWord instanceof InflectedWord) ||
                otherWord.word.getIdWithoutClassifier() != this.word.getIdWithoutClassifier())) {
                disambiguation = this.getEnglish()
            }
            else if (!homonyms.find((otherWord) => otherWord.getWordFact().getId() == this.getWordFact().getId())) {
                disambiguation = this.word.toText()
            }
            else {
                if (!homonyms.find((otherWord) => otherWord instanceof InflectedWord && 
                    otherWord.form == this.form && otherWord.word.toText() == this.word.toText())) {
                    disambiguation = this.form + ', ' + this.word.toText()
                }
                else {
                    disambiguation = this.form + ', ' + this.word.toText() + ', ' + this.getEnglish()
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

    getWordFact(): Fact {
        return this.word
    }

    getId() {
        return this.word.getId() + '@' + this.form
            + (this.omitted ? '*' : '')
    }

    static getEnglishForm(pos: string, formString: string, en: { [ form: string ]: string }): string {
        let form = FORMS[formString]

        if (!form) {
            console.warn(`Unknown form ${formString}.`)
            return ''
        }

        let result = ''

        if (pos == 'v') {
            if (formString == '1') {
                result = '1'
            }
            else if (formString == '3') {
                result = '3'
            }
            else if (formString == 'inf') {
                result = 'inf'
            }
            else if (form.tense == Tense.PAST) {
                if (form.number == Number.PLURAL && en['pastpl']) {
                    result = 'pastpl'
                }
                else {
                    result = 'past'
                }
            }
            else if (form.number == Number.PLURAL) {
                result = 'pl'
            }
        }
        else if (pos == 'adj') {
            if (form.comparison == Comparison.COMPARATIVE) {
                result = 'comp'
            }
            else if (form.pos == PartOfSpeech.ADVERB) {
                result = 'adv'
            }
            else if (form.number == Number.PLURAL) {
                result = 'pl'
            }
        }
        else if (pos == 'pron') {
            if (form.grammaticalCase != null && form.grammaticalCase != GrammaticalCase.NOM) {
                result = 'acc'
            }
        }
        else if (pos == 'n') {
            if (form.number == Number.PLURAL) {
                result = 'pl'
            }
        }

        return result
    }

    getEnglish(form?, translationIndex?: number) {
        if (!form) {
            form = InflectedWord.getEnglishForm(this.pos, this.form, this.en)
        }

        var result = super.getEnglish(form, translationIndex)

        if (!result) {
            result = this.word.getEnglish('', translationIndex)

            // TODO: remove? 
            if (form == 'inf') {
                result = 'to ' + result
            }
        }

        return result
    }
}