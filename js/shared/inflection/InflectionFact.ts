'use strict'

import AbstractFact from '../fact/AbstractFact'
import Inflection from './Inflection'
import { AdjectiveForm, PartOfSpeech, PronounForm } from './Dimensions'
import { FORMS, CASES } from './InflectionForms'

export default class InflectionFact extends AbstractFact {
    constructor(id, public inflection: Inflection, public form: string) {
        super(id);
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

        if (form.adjectiveForm == AdjectiveForm.COMPARATIVE) {
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