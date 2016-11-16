import { ENGLISH_FORMS_BY_POS } from './InflectionForms';

import * as Dimension from './Dimensions'

export const FORM_PROPS = [ 'pos', 'gender', 'animate', 'number', 'person', 'numberEn', 'aspect', 'reflex', 'negation' ]

export class WordCoordinates {
    pos?: Dimension.PartOfSpeech
    gender?: Dimension.Gender
    animate?: Dimension.Animateness
    number?: Dimension.GrammarNumber
    person?: Dimension.Person
    numberEn?: Dimension.GrammarNumber
    aspect?: Dimension.Aspect

    reflex?: Dimension.Reflexivity
    negation?: Dimension.Negation
}

export class WordForm extends WordCoordinates {
    pos?: Dimension.PartOfSpeech
    gender?: Dimension.Gender
    animate?: Dimension.Animateness
    number?: Dimension.GrammarNumber
    person?: Dimension.Person
    numberEn?: Dimension.GrammarNumber
    aspect?: Dimension.Aspect
    reflex?: Dimension.Reflexivity
    negation?: Dimension.Negation

    constructor(coordinates: WordCoordinates) {
        super() 

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

export class NamedWordForm extends WordForm {
    constructor(public id: string, coordinates: WordCoordinates) {
        super(coordinates)
    }
}

export default WordForm