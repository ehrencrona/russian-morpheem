/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement, createFactory } from 'react'

import { EndingTransform } from '../../shared/Transforms'

import Word from '../../shared/Word'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import Phrase from '../../shared/phrase/Phrase'
import Sentence from '../../shared/Sentence'
import InflectableWord from '../../shared/InflectableWord'

import UnknownFact from './UnknownFact'
import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import InflectionFact from '../../shared/inflection/InflectionFact'

import DesiredFormFactComponent from './DesiredFormFactComponent'
import DesiredWordFactComponent from './DesiredWordFactComponent'
import DesiredPhraseFactComponent from './DesiredPhraseFactComponent'
import InflectionFactComponent from './InflectionFactComponent'
import EndingTransformFactComponent from './EndingTransformFactComponent'
import WordFactComponent from './WordFactComponent'
import PhraseFactComponent from './PhraseFactComponent'
import { TranslatableFact } from './WordFactComponent'

export interface FactComponentProps<FactType> {
    knowledge: NaiveKnowledge,
    corpus: Corpus,
    unknownFact: UnknownFact,
    sentence: Sentence,
    fact: FactType,
    hiddenFact: Fact
}

interface Props extends FactComponentProps<Fact> {
    onKnew: (fact: UnknownFact) => void,
    known: boolean,
    hiddenFact: Fact
}

let React = { createElement: createElement }

let unknownFactComponent = (props: Props) => {
    let fact = props.unknownFact.fact

    let content
    let explainable
    let canExplain = false

    let componentType

    if (props.hiddenFact && fact.getId() == props.hiddenFact.getId()) {
        if (fact instanceof InflectionFact) {
            componentType = createFactory(DesiredFormFactComponent) 
        }
        else if (fact instanceof InflectableWord || fact instanceof Word) {
            componentType = createFactory(DesiredWordFactComponent)
        }
        else if (fact instanceof Phrase) {
            componentType = createFactory(DesiredPhraseFactComponent) 
        }
    }
    else if (fact instanceof InflectionFact) {
        canExplain = true

        componentType = createFactory(InflectionFactComponent)
    }
    else if (fact instanceof InflectableWord || fact instanceof Word) {
        componentType = createFactory(WordFactComponent)
    }
    else if (fact instanceof EndingTransform) {
        componentType = createFactory(EndingTransformFactComponent)
    }
    else if (fact instanceof Phrase) {
        componentType = createFactory(PhraseFactComponent)
    }
    
    if (!componentType) {
        console.warn('Unhandled fact type', fact)

        componentType = () => <span>{ fact.getId() }</span>
    }

    return <li>
            <div className='content'>
                 { componentType({
                    fact: fact, 
                    corpus: props.corpus,
                    knowledge: props.knowledge,
                    sentence: props.sentence,
                    hiddenFact: props.hiddenFact,
                    unknownFact: props.unknownFact }, []) }  
            </div>

            <div className='buttonBar'>
                { canExplain ?
                    <div className='button' onClick={ () => explainable.explain() }>Explain</div>
                    :
                    []
                }
                <div className='button iKnew' onClick={ () => props.onKnew(props.unknownFact) }>{
                    !props.known ?
                        'I didn\'t know that' :
                        'I knew that'
                }</div>
            </div>
        </li>
}

export default unknownFactComponent;