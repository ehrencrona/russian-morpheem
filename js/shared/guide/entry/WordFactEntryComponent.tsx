import { encode } from 'punycode';
import { PartOfSpeech } from '../../inflection/Dimensions';

import AnyWord from '../../../shared/AnyWord'

import { Component, createElement } from 'react'

interface Props {
    fact: AnyWord
}

interface State {}

let React = { createElement: createElement }

export default class FactComponent extends Component<Props, State> {
    render() {
        let fact = this.props.fact

        let en

        if (fact.wordForm.pos == PartOfSpeech.VERB) {
            en = fact.getEnglish('inf')
        }
        else {
            en = fact.getEnglish()
        }

        return <dl>
            <dt>{ fact.toText() }</dt>
            <dd>{ en }</dd>
        </dl>
    }
}
