/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus';
import Fact from '../shared/Fact';
import SentenceModel from '../shared/Sentence';
import { Tab } from './TabSet'

import { Component, createElement } from 'react';
import { findSentencesForFact, FactSentences } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    sentence: SentenceModel,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

interface FactIndex {
    index: number,
    fact: Fact
}

export default class Sentence extends Component<Props, State> {
    render() {
        
        let factsById = {}
        
        this.props.sentence.visitFacts((fact: Fact) => {
            factsById[fact.getId()] = fact
        })
        
        let sortedFacts: FactIndex[] = []
        
        for (let id in factsById) {
            let fact = factsById[id]
            
            sortedFacts.push({
                index: this.props.corpus.facts.indexOf(fact),
                fact: fact
            })
        }
        
        sortedFacts = sortedFacts.sort((f1, f2) => f1.index - f2.index)
        
        return (<div>
            <h3>{ this.props.sentence.toString() }</h3>
            
            <div>
            
            {
                
                sortedFacts.map((factIndex : FactIndex) => 
                    <div>{factIndex.index}: {factIndex.fact.getId()}
                    </div>
                )
                
            }
            
            </div> 
        </div>)
    }
}
