/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import InflectedWord from '../../shared/InflectedWord'
import { getFormName } from '../../shared/inflection/InflectionForms' 
import InflectionFact from '../../shared/inflection/InflectionFact'
import { FactComponentProps } from './UnknownFactComponent'

let React = { createElement: createElement }

let inflectionFactComponent = (props: FactComponentProps<InflectionFact>) => {
    let word = props.unknownFact.word

    if (word instanceof InflectedWord) {
        return <div><strong>{ word.jp }</strong> is the <strong>{ getFormName(word.form) }</strong> of <strong>{ word.word.getDefaultInflection().jp }</strong></div>
    }
    else {
        console.warn(word + ' was not inflected yet InflectionFactComponent got it.')

        return <div/>
    }
}

export default inflectionFactComponent;
