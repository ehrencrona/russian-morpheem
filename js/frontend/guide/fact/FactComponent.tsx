

import Corpus from '../../../shared/Corpus'
import Fact from '../../../shared/fact/Fact'
import InflectedWord from '../../../shared/InflectedWord'
import InflectionFact from '../../../shared/inflection/InflectionFact'
import { InflectionForm } from '../../../shared/inflection/InflectionForms' 
import Phrase from '../../../shared/phrase/Phrase'
import PhraseCase from '../../../shared/phrase/PhraseCase'

import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import InflectableWord from '../../../shared/InflectableWord'
import { EndingTransform } from '../../../shared/Transforms'
import Word from '../../../shared/Word'
import AbstractAnyWord from '../../../shared/AbstractAnyWord'

import InflectionFactComponent from './InflectionFactComponent'
import InflectionFormComponent from './InflectionFormComponent'
import WordFactComponent from './WordFactComponent'
import PhraseFactComponent from './PhraseFactComponent'

import StudyFact from '../../study/StudyFact'

import { Component, createElement } from 'react'

interface Props {
    corpus: Corpus,
    fact: Fact
    context: InflectedWord
    knowledge: NaiveKnowledge
    onClose: () => any
    onSelectFact: (fact: Fact, context?: InflectedWord) => any
}

interface State {}

let React = { createElement: createElement }

export default function factComponent(props: Props) {
    let fact = props.fact

    let content

    if (fact instanceof InflectionFact) {
        content = <InflectionFactComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            word={ props.context } 
            onSelectFact={ props.onSelectFact }
        />
    }
    else if (fact instanceof InflectableWord || fact instanceof Word) {
        content = <WordFactComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            word={ fact }
            onSelectFact={ props.onSelectFact }
        />
    }
    else if (fact instanceof Phrase) {
        content = <PhraseFactComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            phrase={ fact }
            onSelectFact={ props.onSelectFact }
        />
    }
    else if (fact instanceof InflectionForm) {
        content = <InflectionFormComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            form={ fact }
            onSelectFact={ props.onSelectFact }
        />
    }
    else {
        content = <div>Unhandled fact { fact.getId() }</div>
    }

    return <div className='overlayContainer' onClick={ props.onClose }>
        <div className='overlay'>
            <div className='content guide' onClick={ (e) => e.stopPropagation() }>
                {content}
            </div>
        </div>
    </div>
}

