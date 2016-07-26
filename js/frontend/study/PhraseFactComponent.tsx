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
    let words = props.fact.match(props.sentence.words, props.corpus.facts)
        .map((m) => props.sentence.words[m.index])
        .map((word) => word.jp).join(' ')

    let phrase: Phrase = props.fact

    let blocks = phrase.getEnglishBlocks()

    let match = phrase.match(props.sentence.words, props.corpus.facts)

    let explanation
    
    if (match) {
        explanation = blocks.map((b) => b.enWithJpForCases(match)).join(' ') 
    }
    else {
        explanation = phrase.en

        console.error(phrase.id + ' did not match ' + props.sentence)
    }

    return <div><strong>
            { words }
        </strong> means <strong>
            { explanation }
        </strong>
    </div>
}

export default phraseFactComponent;
