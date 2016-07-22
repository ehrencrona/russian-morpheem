/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import InflectedWord from '../../shared/InflectedWord'
import Phrase from '../../shared/phrase/Phrase'
import Fact from '../../shared/fact/Fact'

import UnknownFact from './UnknownFact'

import { FactComponentProps } from './UnknownFactComponent'

let React = { createElement: createElement }

let phraseFactComponent = (props: FactComponentProps<Phrase>) => {
    console.log('phrase fact')
    
    let words = props.fact.match(props.sentence.words, props.corpus.facts)
        .map((index) => props.sentence.words[index])
        .map((word) => word.jp).join(' ')

    return <div><strong>
            { words }
        </strong> is an example of <strong>
            { props.fact.description }
        </strong> meaning <strong>
            { props.fact.en }
        </strong>
    </div>
}

export default phraseFactComponent;
