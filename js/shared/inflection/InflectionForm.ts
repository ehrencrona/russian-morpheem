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

const FORM_PROPS = [ 'gender', 'tense', 'grammaticalCase', 'animate', 
    'number', 'person', 'command', 'adjectiveForm', 'pos', 'pronounForm' ]

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

    equals(other: InflectionCoordinates) {
        let mismatch = (prop: string) => 
            (other[prop] || this[prop]) && this[prop] != other[prop]

        return !FORM_PROPS.find(mismatch)
    }

    matches(other: InflectionCoordinates) {
        let mismatch = (prop: string) => 
            this[prop] && this[prop] != other[prop]

        return !FORM_PROPS.find(mismatch)
    }
}

export default InflectionForm 
