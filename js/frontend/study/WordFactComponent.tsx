

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import InflectedWord from '../../shared/InflectedWord'
import Translatable from '../../shared/Translatable'
import Fact from '../../shared/fact/Fact'

import { FactComponentProps } from './StudyFactComponent'

let React = { createElement: createElement }

export interface TranslatableFact extends Fact, Translatable {
}

let wordFactComponent = (props: FactComponentProps<TranslatableFact>) => {
    return <div><strong>{ 
        props.fact.toText() 
    }</strong> means <strong>{ props.fact.getEnglish() }</strong></div>
}

export default wordFactComponent;
