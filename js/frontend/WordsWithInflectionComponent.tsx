/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import InflectedWord from '../shared/InflectedWord'
import Inflection from '../shared/Inflection'

import { Tab } from './TabSetComponent'
import FactComponent from './FactComponent'
import SentenceComponent from './SentenceComponent'
import Sentence from '../shared/Sentence'
import Word from '../shared/Word'

import { Component, createElement } from 'react';
import { findSentencesForFact, FactSentences } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    inflection: Inflection,
    tab: Tab,
    form: string
}

interface State {}

let React = { createElement: createElement }

export default class WordsWithInflectionComponent extends Component<Props, State> {
    
    render() {
        let words: InflectedWord[] = this.props.corpus.facts.facts.filter((fact) => {
            return fact instanceof InflectedWord && fact.inflection == this.props.inflection; 
        }).map((word: InflectedWord) => {
            return word.inflect(this.props.form)
        })


        return <div>
        {
            words.map((word) => {            
                let index = this.props.corpus.facts.indexOf(word.infinitive);
                
                return <div key={ word.getId() } className='clickable' onClick={ () =>
                    this.props.tab.openTab(
                        <FactComponent corpus={ this.props.corpus } tab={ this.props.tab } fact={ word }/>, word.toString(), word.getId()
                    ) 
                }>
                    <div className='index'><div className='number'>{ index + 1 }</div></div>
                    { word.toString() } 
                </div>
            })            
        }
        </div>;
    }
    
}