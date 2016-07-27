/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
 
import { FactComponentProps } from './UnknownFactComponent'

let React = { createElement: createElement }

let desiredPhraseFactComponent = (props: FactComponentProps<Phrase>) => {
    return <div>The phrase you are looking for means <strong>{ props.fact.patterns[0].en }</strong></div>
}

export default desiredPhraseFactComponent
