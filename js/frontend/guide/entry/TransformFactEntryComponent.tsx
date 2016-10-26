

import { EndingTransform } from '../../../shared/Transforms'

import { Component, createElement } from 'react'

interface Props {
    fact: EndingTransform
}

interface State {}

let React = { createElement: createElement }

export default class TransformFactEntryComponent extends Component<Props, State> {
    render() {
        let fact = this.props.fact
        
        return <dl>
            <dt>
                { fact.from }
            </dt>
            <dd>
                is replaced with { fact.to } after { fact.after.split('').join(', ') }
            </dd>
        </dl>
   }
}
