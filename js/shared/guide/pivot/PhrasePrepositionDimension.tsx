import { getNamedForm } from '../../inflection/WordForms';
import { PartOfSpeech as PoS, GrammarCase } from '../../inflection/Dimensions';

import PivotDimension from './PivotDimension'
import FactLinkComponent from '../fact/FactLinkComponent';
import Word from '../../../shared/Word'
import Phrase from '../../../shared/phrase/Phrase'

import { Component, createElement } from 'react';

let React = { createElement: createElement }

export default class PhrasePrepositionDimension implements PivotDimension<Word> {
    name = 'Preposition'

    constructor(public factLinkComponent: FactLinkComponent) {
    }

    getKey(value: Word) {
        return value.getId()
    }

    getValues(fact) {
        if (fact instanceof Phrase) {
            return fact.getWords()
                .map(w => w instanceof Word && w.wordForm.pos == PoS.PREPOSITION ? w : null)
                .filter(w => !!w)
        }
    }

    renderValue(value: Word) {
        if (!value) {
            return null
        }

        return React.createElement(
            this.factLinkComponent, {
                fact: value
            },
            value.toText()
        )
    }

}