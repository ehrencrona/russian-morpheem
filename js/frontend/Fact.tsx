/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import FactModel from '../shared/Fact'
import { Tab } from './TabSet'
import Sentence from './Sentence'

import { Component, createElement } from 'react';
import { findSentencesForFact, FactSentences } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    fact: FactModel,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class Fact extends Component<Props, State> {
    render() {
        let index : FactSentences =
            findSentencesForFact(this.props.fact, this.props.corpus.sentences, this.props.corpus.facts)
        
        let toSentence = (sentence) => {
            return <div 
                key={ sentence.id }
                onClick={ () => this.props.tab.openTab(
                    <Sentence sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
                    sentence.toString(),
                    sentence.id
                ) }>{ sentence.toString() }</div>
        }
         
        return (<div>
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
