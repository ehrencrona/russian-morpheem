

import { Component, createElement, createFactory } from 'react'

import { EndingTransform } from '../../../shared/Transforms'

import Word from '../../../shared/Word'
import Corpus from '../../../shared/Corpus'
import Fact from '../../../shared/fact/Fact'
import Phrase from '../../../shared/phrase/Phrase'
import PhraseCase from '../../../shared/phrase/PhraseCase'
import Sentence from '../../../shared/Sentence'
import InflectableWord from '../../../shared/InflectableWord'
import AbstractAnyWord from '../../../shared/AbstractAnyWord'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import InflectionFact from '../../../shared/inflection/InflectionFact'
import FixedIntervalFactSelector from '../../../shared/study/FixedIntervalFactSelector'
import { REPETITION_COUNT } from '../../../shared/study/FixedIntervalFactSelector'

import StudyFact from '../StudyFact'
import InflectionFactComponent from './InflectionFactComponent'
import EndingTransformFactComponent from './EndingTransformFactComponent'
import WordFactComponent from './WordFactComponent'
import PhraseCaseComponent from './PhraseCaseComponent'
import PhraseCaseComponentNoWords from './PhraseCaseComponentNoWords'
import PhraseFactComponent from './PhraseFactComponent'
import { TranslatableFact } from './WordFactComponent'

export interface FactComponentProps<FactType> {
    knowledge: NaiveKnowledge,
    corpus: Corpus,
    studyFact: StudyFact,
    sentence: Sentence,
    fact: FactType,
    hiddenFacts: StudyFact[]
}

interface Props extends FactComponentProps<Fact> {
    onKnew: (fact: StudyFact) => void
    onExplain: (fact: StudyFact) => void
    factSelector: FixedIntervalFactSelector
    known: boolean
}

let React = { createElement: createElement }

const INDICATOR = [ ]

for (let i = 0; i < REPETITION_COUNT; i++) {
    INDICATOR.push(i)
}

let studyFactComponent = (props: Props) => {
    let fact = props.studyFact.fact

    let content
    let explainable
    let canExplain = false

    let componentType

    if (fact instanceof InflectionFact) {
        canExplain = true

        componentType = createFactory(InflectionFactComponent)
    }
    else if (fact instanceof AbstractAnyWord) {
        componentType = createFactory(WordFactComponent)

        canExplain = true
    }
    else if (fact instanceof EndingTransform) {
        componentType = createFactory(EndingTransformFactComponent)
    }
    else if (fact instanceof PhraseCase) {
        if (fact.phrase.hasWordFacts) {
            componentType = createFactory(PhraseCaseComponent)
        }
        else {
            componentType = createFactory(PhraseCaseComponentNoWords)
        }
    }
    else if (fact instanceof Phrase) {
        componentType = createFactory(PhraseFactComponent)
        canExplain = true
    }

    if (props.hiddenFacts.length) {
        canExplain = false
    }

    if (!componentType) {
        console.warn('Unhandled fact type', fact)

        componentType = () => <span>{ fact.getId() }</span>
    }

    let lastStudied = props.factSelector.getLastStudied(fact)
    let repetition = (lastStudied ? lastStudied.repetition : 0)

    return <li>
        <div className='content' onClick={ () => canExplain && props.onExplain(props.studyFact) }>

            { componentType({
                fact: fact, 
                corpus: props.corpus,
                knowledge: props.knowledge,
                sentence: props.sentence,
                hiddenFacts: props.hiddenFacts,
                studyFact: props.studyFact, 
            }, []) }  

            <div className='explain'>
                <div className='repetitionIndicator'>
                {
                    INDICATOR.map(i =>
                        <div key={'rep'+i} className={(i <= repetition ? 'full' : 'empty')}>&nbsp;</div>
                    )
                }
                </div>
                <div className='space'/>
                { canExplain ? 
                    <div className='button'>
                        <span className='text'>Explain</span>
                    </div>
                    :
                    [] }
            </div>
        </div>
    </li>
}

export default studyFactComponent;