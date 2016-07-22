/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
 
import { FactComponentProps } from './UnknownFactComponent'

let React = { createElement: createElement }

let desiredPhraseFactComponent = (props: FactComponentProps<Phrase>) => {
    return <div>The phrase you are looking for uses the pattern <strong>{ props.fact.en }</strong></div>
}

export default desiredPhraseFactComponent
