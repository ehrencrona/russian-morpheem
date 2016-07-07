/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import InflectedWord from '../../shared/InflectedWord'
import Translatable from '../../shared/Translatable'

import UnknownFact from './UnknownFact'
import { FORM_NAMES } from '../../shared/inflection/InflectionForms' 

import { FactComponentProps } from './UnknownFactComponent'

let React = { createElement: createElement }

let wordFactComponent = (props: FactComponentProps<Translatable>) => {
    return <div><strong>{ props.fact.toText() }</strong> means <strong>{ props.fact.getEnglish() }</strong></div>
}

export default wordFactComponent;
