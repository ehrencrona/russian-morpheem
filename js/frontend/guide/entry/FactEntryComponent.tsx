

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

import StudyFact from '../../study/StudyFact'

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

    let entry

    if (fact instanceof Word || fact instanceof InflectableWord) {
        entry = <WordFactEntryComponent 
            fact={ fact } />
    }
    else if (fact instanceof InflectionFact) {
        entry = <InflectionFactEntryComponent 
            corpus={ props.corpus } 
            fact={ fact } 
            knowledge={ props.knowledge } />
    }
    else if (fact instanceof Phrase) {
        entry = <PhraseFactEntryComponent 
            corpus={ props.corpus } 
            fact={ fact } 
            knowledge={ props.knowledge } />
    }
    else if (fact instanceof PhraseCase) {
        entry = <PhraseCaseFactEntryComponent 
            corpus={ props.corpus } 
            fact={ fact } 
            knowledge={ props.knowledge } />
    }
    else if (fact instanceof EndingTransform) {
        entry = <TransformFactEntryComponent 
            fact={ fact } />
    }
    else {
        entry = <div>Unhandled fact { fact.getId() }</div>
    }

    return entry
}

