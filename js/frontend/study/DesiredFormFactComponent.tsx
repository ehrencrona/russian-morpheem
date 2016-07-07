/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import { FORM_NAMES } from '../../shared/inflection/InflectionForms'
import InflectionFact from '../../shared/inflection/InflectionFact'
 
import { FactComponentProps } from './UnknownFactComponent'

let React = { createElement: createElement }

let desiredFormFactComponent = (props: FactComponentProps<InflectionFact>) => {
    return <div>You are looking for the <strong>{ FORM_NAMES[props.fact.form] }</strong></div>
}

export default desiredFormFactComponent;
