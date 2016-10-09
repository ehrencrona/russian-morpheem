

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

        return <div>
            { fact.toText() } – { fact.getEnglish() }
        </div>
    }
}
