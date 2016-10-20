

import Corpus from '../../../shared/Corpus'
import Fact from '../../../shared/fact/Fact'
import InflectedWord from '../../../shared/InflectedWord'
import InflectionFact from '../../../shared/inflection/InflectionFact'
import Phrase from '../../../shared/phrase/Phrase'
import PhraseCase from '../../../shared/phrase/PhraseCase'

import PhraseFactEntryComponent from './PhraseFactEntryComponent'
import PhraseCaseFactEntryComponent from './PhraseCaseFactEntryComponent'
import WordFactEntryComponent from './WordFactEntryComponent'
import InflectionFactEntryComponent from './InflectionFactEntryComponent'
import TransformFactEntryComponent from './TransformFactEntryComponent'

import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import InflectableWord from '../../../shared/InflectableWord'
import Word from '../../../shared/Word'
import { EndingTransform } from '../../../shared/Transforms'

import { Component, createElement } from 'react'

interface Props {
    corpus: Corpus,
    fact: Fact
    knowledge: NaiveKnowledge
}

interface State {}

let React = { createElement: createElement }

export default function factComponent(props: Props) {
    let fact = props.fact

    if (fact instanceof Word || fact instanceof InflectableWord) {
        return <WordFactEntryComponent fact={ fact } />
    }
    else if (fact instanceof InflectionFact) {
        return <InflectionFactEntryComponent 
            corpus={ props.corpus } 
            fact={ fact } 
            knowledge={ props.knowledge } />
    }
    else if (fact instanceof Phrase) {
        return <PhraseFactEntryComponent 
            corpus={ props.corpus } 
            fact={ fact } 
            knowledge={ props.knowledge } />
    }
    else if (fact instanceof PhraseCase) {
        return <PhraseCaseFactEntryComponent 
            corpus={ props.corpus } 
            fact={ fact } 
            knowledge={ props.knowledge } />
    }
    else if (fact instanceof EndingTransform) {
        return <TransformFactEntryComponent 
            fact={ fact } />
    }
    else {
        return <div>Unhandled fact { fact.getId() }</div>
    }
}

