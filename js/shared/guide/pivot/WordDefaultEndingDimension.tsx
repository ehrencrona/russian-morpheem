import { CASES, FORMS } from '../../inflection/InflectionForms';
import { getNamedForm } from '../../inflection/WordForms';
import { GrammarCase } from '../../inflection/Dimensions';

import PivotDimension from './PivotDimension'
import FactLinkComponent from '../fact/FactLinkComponent';
import Phrase from '../../../shared/phrase/Phrase'
import InflectableWord from '../../../shared/InflectableWord'
import Inflection from '../../../shared/inflection/Inflection'
import Ending from '../../../shared/Ending'

import { Component, createElement } from 'react';

let React = { createElement: createElement }

export default class WordRootInflectionDimension implements PivotDimension<Ending> {
    name = 'Ending'

    constructor(public factLinkComponent: FactLinkComponent, public stepsFromRoot: number) {
    }

    getKey(value: Ending) {
        return value.suffix
    }

    getValues(fact) {
        if (fact instanceof InflectableWord) {
            return [ fact.inflection.getEnding(fact.getDefaultInflection().form) ]
        }
    }

    renderValue(value: Ending) {
        if (!value) {
            return null
        }

        return '-' + value.suffix
    }

}