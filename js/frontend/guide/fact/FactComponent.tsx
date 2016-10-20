

import Corpus from '../../../shared/Corpus'
import Fact from '../../../shared/fact/Fact'
import InflectedWord from '../../../shared/InflectedWord'
import InflectionFact from '../../../shared/inflection/InflectionFact'
import Phrase from '../../../shared/phrase/Phrase'
import PhraseCase from '../../../shared/phrase/PhraseCase'

import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import InflectableWord from '../../../shared/InflectableWord'
import { EndingTransform } from '../../../shared/Transforms'
import Word from '../../../shared/Word'
import AbstractAnyWord from '../../../shared/AbstractAnyWord'

import InflectionFactComponent from './InflectionFactComponent'
import WordFactComponent from './WordFactComponent'

import StudyFact from '../../study/StudyFact'

import { Component, createElement } from 'react'

interface Props {
    corpus: Corpus,
    fact: StudyFact
    knowledge: NaiveKnowledge
    onClose: () => any
}

interface State {}

let React = { createElement: createElement }

export default function factComponent(props: Props) {
    let studyFact = props.fact

    let content

    if (studyFact.fact instanceof InflectionFact) {
        content = <InflectionFactComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            onSelect={ () => {} }
            word={ props.fact.words[0].word as InflectedWord } 
        />
    }
    else if (studyFact.fact instanceof AbstractAnyWord) {
        content = <WordFactComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            onSelect={ () => {} }
            word={ props.fact.words[0].word as InflectedWord } 
        />
    }
    else {
        content = <div>Unhandled fact { studyFact.fact.getId() }</div>
    }

    return <div className='overlayContainer' onClick={ props.onClose }>
        <div className='overlay'>
            {content}
        </div>
    </div>
}

