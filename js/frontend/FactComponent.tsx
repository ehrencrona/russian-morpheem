/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import InflectedWord from '../shared/InflectedWord'

import { Tab } from './TabSetComponent'
import Sentence from './SentenceComponent'

import { Component, createElement } from 'react';
import { findSentencesForFact, FactSentences } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    fact: Fact,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class FactComponent extends Component<Props, State> {
    render() {
        let fact = this.props.fact
        
        let index : FactSentences =
            findSentencesForFact(fact, this.props.corpus.sentences, this.props.corpus.facts)
        
        let toSentence = (sentence) => {
            return <div 
                key={ sentence.id }
                onClick={ () => this.props.tab.openTab(
                    <Sentence sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
                    sentence.toString(),
                    sentence.id
                ) }>{ sentence.toString() }</div>
        }
         
        let inflectionComponents = []
        
        if (fact instanceof InflectedWord) {
            let inflections: InflectedWord[] = []
            
            fact.visitAllInflections((inflected: InflectedWord) => { 
                inflections.push(inflected)    
            }, false)
            
            inflectionComponents = inflections.map((word: InflectedWord) => 
                <div>{ word.form }: { word.toString() }</div>
            )
        }
         
        return (<div>
            { inflectionComponents }
        
            <h3>Easy</h3> 
            {
                index.easy.map(toSentence)
            }

            <h3>Hard</h3> 
            {
                index.hard.map(toSentence)
            }
            </div>)
    }
}
