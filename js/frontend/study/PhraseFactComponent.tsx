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
    let phrase: Phrase = props.fact
    let match = phrase.match(props.sentence.words, props.corpus.facts)

    let explanation, words
    
    if (match) {
        let blocks = match.pattern.getEnglishFragments()
        
        explanation = blocks.map((b) => b.enWithJpForCases(match)).join(' ') 
        
        words = match.words.map((m) => props.sentence.words[m.index])
            .map((word) => word.jp).join(' ')
    }
    else {
        explanation = phrase.patterns[0].en

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
