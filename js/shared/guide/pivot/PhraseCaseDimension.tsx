import { CASES, FORMS } from '../../inflection/InflectionForms';
import { getNamedForm } from '../../inflection/WordForms';
import { GrammarCase } from '../../inflection/Dimensions';

import PivotDimension from './PivotDimension'
import FactLinkComponent from '../fact/FactLinkComponent';
import Phrase from '../../../shared/phrase/Phrase'

import { Component, createElement } from 'react';

let React = { createElement: createElement }

export default class PhraseCaseDimension implements PivotDimension<GrammarCase> {
    name = 'Case'

    constructor(public factLinkComponent: FactLinkComponent) {
    }

    getKey(value: GrammarCase) {
        return value
    }

    getValues(fact) {
        if (fact instanceof Phrase) {
            let result = fact.getCases().filter(c => c != GrammarCase.NOM)

            // ambiguous if we are looking to break down phrases for a preposition by case.
            if (result.length > 1) {
                result = []
            }

            return result
        }
    }

    renderValue(value: GrammarCase) {
        if (!value) {
            return null
        }

        return React.createElement(
            this.factLinkComponent, {
                fact: FORMS[CASES[value]]
            },
            <div className={ 'caseName ' + CASES[value] }>
                { CASES[value].toUpperCase() }
            </div>
        )
    }

}