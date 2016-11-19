import { CASES, FORMS } from '../../inflection/InflectionForms';
import { getNamedForm } from '../../inflection/WordForms';
import { Gender, GrammarCase } from '../../inflection/Dimensions';

import PivotDimension from './PivotDimension'
import FactLinkComponent from '../fact/FactLinkComponent';
import Phrase from '../../../shared/phrase/Phrase'
import InflectableWord from '../../../shared/InflectableWord'
import Inflection from '../../../shared/inflection/Inflection'
import Ending from '../../../shared/Ending'

import { Component, createElement } from 'react';

let React = { createElement: createElement }

export let GENDERS: { [id: number] : string } = {}

GENDERS[Gender.M] = 'masculine'
GENDERS[Gender.F] = 'feminine'
GENDERS[Gender.N] = 'neuter'

export default class NounGenderDimension implements PivotDimension<Gender> {
    name = 'Gender'

    constructor() {
    }

    getKey(value: Gender) {
        return value
    }

    getValues(fact) {
        if (fact instanceof InflectableWord) {
            return [ fact.wordForm.gender ]
        }
    }

    renderValue(value: Gender) {
        return GENDERS[value]
    }

}