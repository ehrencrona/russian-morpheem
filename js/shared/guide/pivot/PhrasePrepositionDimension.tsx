import { getNamedForm } from '../../inflection/WordForms';
import { PartOfSpeech as PoS, GrammarCase } from '../../inflection/Dimensions';

import PivotDimension from './PivotDimension'
import FactLinkComponent from '../fact/FactLinkComponent';
import AnyWord from '../../../shared/AnyWord'
import Phrase from '../../../shared/phrase/Phrase'

import { Component, createElement } from 'react';

let React = { createElement: createElement }

export default class PhrasePrepositionDimension implements PivotDimension<AnyWord> {
    name = 'Preposition'

    constructor(public factLinkComponent: FactLinkComponent) {
    }

    getKey(value: AnyWord) {
        return value.getId()
    }

    getValues(fact) {
        if (fact instanceof Phrase) {
            let prepositions = fact.getWords()
                .map(w => w.wordForm.pos == PoS.PREPOSITION ? w : null)
                .filter(w => !!w)

            // if we have more than one preposition we cant say which case belongs to it
            if (prepositions.length == 1) {
                return prepositions
            }
        }

        return []
    }

    renderValue(value: AnyWord) {
        if (!value) {
            return null
        }

        return React.createElement(
            this.factLinkComponent, {
                fact: value.getWordFact()
            },
            value.toText()
        )
    }

}