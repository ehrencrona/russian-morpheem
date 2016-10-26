

import { InflectionForm } from '../../../shared/inflection/InflectionForms'

import { Component, createElement } from 'react'

interface Props {
    fact: InflectionForm
}

interface State {}

let React = { createElement: createElement }

export default class InflectionFormEntryComponent extends Component<Props, State> {
    render() {
        let fact = this.props.fact
        
        return <dl>
            <dt>
            </dt>
            <dd> the {
                fact.name 
            } form</dd>
        </dl>
   }
}
