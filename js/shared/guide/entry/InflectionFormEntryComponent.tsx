

import InflectionForm from '../../../shared/inflection/InflectionForm'

import { Component, createElement } from 'react'

interface Props {
    fact: InflectionForm
}

interface State {}

let React = { createElement: createElement }

export default function InflectionFormEntryComponent(props: Props) {
    return <dl>
        <dt>
        </dt>
        <dd> the {
            props.fact.name 
        } form</dd>
    </dl>
}
