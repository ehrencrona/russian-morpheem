/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Translatable from '../../shared/Translatable'
 
import { FactComponentProps } from './UnknownFactComponent'

let React = { createElement: createElement }

let desiredWordFactComponent = (props: FactComponentProps<Translatable>) => {
    return <div>The word you are looking for means <strong>{ props.fact.getEnglish() }</strong></div>
}

export default desiredWordFactComponent
