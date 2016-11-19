import { ENGLISH_FORMS_BY_POS } from './InflectionForms';
import Fact from '../fact/Fact'

import * as Dimension from './Dimensions'

export const FORM_PROPS = [ 
    'pos', 'gender', 'animate', 'number', 'person', 'card',
    'numberEn', 'aspect', 'reflex', 'negation', 'grammaticalCase' 
]

export interface WordCoordinates {
    pos?: Dimension.PartOfSpeech
    gender?: Dimension.Gender
    animate?: Dimension.Animateness
    number?: Dimension.GrammarNumber
    person?: Dimension.Person
    numberEn?: Dimension.GrammarNumber
    aspect?: Dimension.Aspect
    grammaticalCase?: Dimension.GrammarCase

    card?: Dimension.Cardinality
    reflex?: Dimension.Reflexivity
    negation?: Dimension.Negation
}

export class WordForm implements WordCoordinates {
    pos?: Dimension.PartOfSpeech
    gender?: Dimension.Gender
    animate?: Dimension.Animateness
    number?: Dimension.GrammarNumber
    person?: Dimension.Person
    numberEn?: Dimension.GrammarNumber
    aspect?: Dimension.Aspect
    reflex?: Dimension.Reflexivity
    negation?: Dimension.Negation
    grammaticalCase?: Dimension.GrammarCase
    card?: Dimension.Cardinality

    constructor(coordinates: WordCoordinates) {
        Object.assign(this, coordinates)
    }

    isCompatibleWith(other: WordCoordinates) {
        let mismatch = (prop: string) => 
            other[prop] && this[prop] && this[prop] != other[prop]

        return !FORM_PROPS.find(mismatch)
    }

    equals(other: WordCoordinates) {
        let mismatch = (prop: string) => 
            (other[prop] || this[prop]) && this[prop] != other[prop]

        return !FORM_PROPS.find(mismatch)
    }

    matches(other: WordCoordinates) {
        let mismatch = (prop: string) => 
            other[prop] && this[prop] != other[prop]

        return !FORM_PROPS.find(mismatch)
    }

    copyFrom(other: WordCoordinates) {
        let apply = (prop: string) => {
            if (other[prop]) {
                this[prop] = other[prop]
            }
        }

        FORM_PROPS.forEach(apply)
    }

    add(coord: WordCoordinates) {
        FORM_PROPS.forEach(prop => {
            if (coord[prop]) {
                this[prop] = coord[prop]
            } 
        })
    }

    remove(coord: WordCoordinates) {
        FORM_PROPS.forEach(prop => {
            if (coord[prop]) {
                this[prop] = coord[prop]
            } 
        })
    }
}

export class NamedWordForm extends WordForm implements Fact {
    constructor(public id: string, public name: string, coordinates: WordCoordinates) {
        super(coordinates)
    }

    toString() {
        return this.id
    }

    getId() {
        return this.id
    }

    visitFacts(visitor: (Fact) => any): any {
        visitor(this)
    }

    requiresFact(fact: Fact) {
        // ignore.
    }
}

export default WordForm