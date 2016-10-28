'use strict'

import Grammar from '../Grammar'
import Inflection from './Inflection'
import { FORMS, CASES, AdjectiveForm, PartOfSpeech, Comparison, PronounForm } from './InflectionForms'

export default class InflectionFact extends Grammar {
    constructor(public id, public inflection: Inflection, public form: string) {
        super(id, '');
    }

    visitFacts(visitor: (Fact) => any) {

        visitor(this)

        let form = FORMS[this.form]
        
        if (form.grammaticalCase) {
            visitor(FORMS[CASES[form.grammaticalCase]])
        }

        if (form.pos == PartOfSpeech.ADVERB) {
            visitor(FORMS["adv"])
        }

        if (form.comparison == Comparison.COMPARATIVE) {
            visitor(FORMS["comp"])
        }

        if (form.adjectiveForm == AdjectiveForm.SHORT) {
            visitor(FORMS["short"])
        }

        if (form.pronounForm == PronounForm.ALTERNATIVE) {
            visitor(FORMS["alt"])
        }

    }

}