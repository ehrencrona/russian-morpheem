import Fact from '../fact/Fact'
import AbstractFact from '../fact/AbstractFact'

import { FORMS, CASES } from './InflectionForms'

import * as Dimension from './Dimensions'

export interface InflectionCoordinates {
    gender?: Dimension.Gender
    tense?: Dimension.Tense
    grammaticalCase?: Dimension.GrammarCase
    animate?: Dimension.Animateness
    number?: Dimension.GrammarNumber
    person?: Dimension.Person
    adjectiveForm?: Dimension.AdjectiveForm
    pos?: Dimension.PartOfSpeech
    pronounForm?: Dimension.PronounForm
    command?: Dimension.Command
}

export class InflectionForm extends AbstractFact implements InflectionCoordinates {
    gender: Dimension.Gender
    tense: Dimension.Tense
    grammaticalCase: Dimension.GrammarCase 
    animate: Dimension.Animateness
    number: Dimension.GrammarNumber
    person: Dimension.Person
    command: Dimension.Command
    adjectiveForm: Dimension.AdjectiveForm
    pos: Dimension.PartOfSpeech
    pronounForm: Dimension.PronounForm

    constructor(id: string, public name: string, used: InflectionCoordinates) {
        super(id)
        this.name = name
        this.gender = used.gender
        this.tense = used.tense
        this.grammaticalCase = used.grammaticalCase
        this.animate = used.animate
        this.number = used.number
        this.person = used.person
        this.command = used.command
        this.adjectiveForm = used.adjectiveForm
        this.pos = used.pos
        this.pronounForm = used.pronounForm
    }

    getComponents(): InflectionForm[] {
        let result: InflectionForm[] = []

        let addForm = (form: string) => {
            if (this.id != form) {
                result.push(FORMS[form])
            }
        }

        if (this.grammaticalCase) {
            addForm(CASES[this.grammaticalCase])
        }

        if (this.adjectiveForm == Dimension.AdjectiveForm.SHORT) {
            addForm('short')
        }

        if (this.number == Dimension.GrammarNumber.PLURAL) {
            addForm('pl')
        }

        if (this.tense == Dimension.Tense.PAST) {
            addForm('past')
        }

        if (this.pronounForm == Dimension.PronounForm.ALTERNATIVE) {
            addForm('alt')
        }

        if (this.command == Dimension.Command.IMPERATIVE) {
            addForm('imperative')
        }

        return result
    }

    getId() {
        return this.id
    }

    visitFacts(visitor: (Fact) => any) {
        visitor(this)
    }

    matches(otherForm: InflectionForm) {
        return !(
            (this.grammaticalCase != null && this.grammaticalCase != otherForm.grammaticalCase) ||
            (this.gender != null && this.gender != otherForm.gender) ||
            (this.person != null && this.person != otherForm.person) ||
            (this.number != null && this.number != otherForm.number) ||
            (this.animate != null && this.animate != otherForm.animate) ||
            (this.adjectiveForm != null && this.adjectiveForm != otherForm.adjectiveForm) ||
            (this.command != null && this.command != otherForm.command) ||
            (this.pos != null && this.pos != otherForm.pos) ||
            (this.pronounForm != null && this.pronounForm != otherForm.pronounForm) ||
            (this.tense != null && this.tense != otherForm.tense))
    }
}

export default InflectionForm 
