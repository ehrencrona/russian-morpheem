/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import InflectableWord from '../shared/InflectableWord'
import InflectedWord from '../shared/InflectedWord'
import Inflection from '../shared/Inflection'

import Tab from './Tab'
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
    addSentence(word: Word) {
        let sentence = new Sentence([ word ], null)

        this.props.corpus.sentences.add(sentence)

        this.openSentence(sentence)
    }

    openSentence(sentence: Sentence) {
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
    }
    
    openFact(word: InflectedWord) {
        let fact = this.props.corpus.facts.get(word.word.getId())

        if (fact) {            
            this.props.tab.openTab(
                <FactComponent corpus={ this.props.corpus } tab={ this.props.tab } fact={ fact }/>, 
                fact.toString(), fact.getId()
            )
        }        
    }

    render() {
        let words: InflectedWord[] = this.props.corpus.facts.facts.filter((fact) => {
            try {
                return fact instanceof InflectableWord && 
                    fact.inflection.getFact(this.props.form).inflection == this.props.inflection; 
            } catch (e) {
                return false
            }
        }).map((word: InflectableWord) => {
            return word.inflect(this.props.form)
            // inflect may return null if the form is masked
        }).filter((word) => !!word)


        return <div className='wordsWithInflection'>
        {
            words.map((word) => {            
                let index = this.props.corpus.facts.indexOf(word.word);

                return <div key={ word.getId() } className='clickable' onClick={ () => this.openFact(word) }>
                    <div className='index'><div className='number'>{ index + 1 }</div></div>
                    { word.toString() }

                    <div className='button' onClick={ (e) => { this.addSentence(word); e.stopPropagation() } }>+ Sentence</div>
                </div>
            })            
        }
        </div>;
    }
    
}