/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'

import { EndingTransform } from '../../shared/Transforms'

import Word from '../../shared/Word'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import InflectableWord from '../../shared/InflectableWord'

import UnknownFact from './UnknownFact'
import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import InflectionFact from '../../shared/inflection/InflectionFact'

import DesiredFormFactComponent from './DesiredFormFactComponent'
import DesiredWordFactComponent from './DesiredWordFactComponent'
import InflectionFactComponent from './InflectionFactComponent'
import WordFactComponent from './WordFactComponent'
import { TranslatableFact } from './WordFactComponent'
import EndingTransformFactComponent from './EndingTransformFactComponent'

export interface FactComponentProps<FactType> {
    knowledge: NaiveKnowledge,
    corpus: Corpus,
    unknownFact: UnknownFact,
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

    if (props.hiddenFact && fact.getId() == props.hiddenFact.getId()) {
        if (fact instanceof InflectionFact) {
            content = <DesiredFormFactComponent 
                fact={ fact } 
                corpus={ props.corpus }
                knowledge={ props.knowledge }
                hiddenFact={ props.hiddenFact }
                unknownFact={ props.unknownFact } />
        }
        else if (fact instanceof InflectableWord || fact instanceof Word) {
            content = <DesiredWordFactComponent 
                fact={ fact } 
                corpus={ props.corpus }
                knowledge={ props.knowledge }
                hiddenFact={ props.hiddenFact }
                unknownFact={ props.unknownFact } />
        }
    }
    else if (fact instanceof InflectionFact) {
        canExplain = true

        content = <InflectionFactComponent 
            fact={ fact } 
            corpus={ props.corpus }
            knowledge={ props.knowledge }
            hiddenFact={ props.hiddenFact }
            unknownFact={ props.unknownFact }
            ref={ (child) => explainable = child  } />
    }
    else if (fact instanceof InflectableWord || fact instanceof Word) {
        content = <WordFactComponent 
            fact={ fact } 
            corpus={ props.corpus }
            knowledge={ props.knowledge }
            hiddenFact={ props.hiddenFact }
            unknownFact={ props.unknownFact } />
    }
    else if (fact instanceof EndingTransform) {
        content = <EndingTransformFactComponent 
            fact={ fact } 
            corpus={ props.corpus }
            knowledge={ props.knowledge }
            hiddenFact={ props.hiddenFact }
            unknownFact={ props.unknownFact } />
    }
    else {
        console.warn('Unhandled fact type', fact)

        content = <span>{ fact.getId() }</span>
    }

    return <li>
            <div className='content'>{ content }</div>

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