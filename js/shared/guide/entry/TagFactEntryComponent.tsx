
import { InflectionForm } from '../../../shared/inflection/InflectionForms'
import TagFact from '../../../shared/TagFact'
import Corpus from '../../../shared/Corpus'

import { Component, createElement } from 'react'

interface Props {
    corpus: Corpus,
    fact: TagFact
}

let React = { createElement: createElement }

export default function TagFactEntryComponent(props: Props) {
    let factoid = props.corpus.factoids.getFactoid(props.fact)
    
    return <dl>
        <dt>
        </dt>
        <dd> {
            (factoid && factoid.name) || props.fact.id 
        }</dd>
    </dl>
}
