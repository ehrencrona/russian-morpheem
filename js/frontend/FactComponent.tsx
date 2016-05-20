/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import InflectedWord from '../shared/InflectedWord'
import InflectionFact from '../shared/InflectionFact'

import Tab from './Tab'
import SentenceComponent from './SentenceComponent'
import InflectionsComponent from './InflectionsComponent'
import ChangeInflectionComponent from './ChangeInflectionComponent'
import WordsWithInflectionComponent from './WordsWithInflectionComponent'
import Sentence from '../shared/Sentence'
import Word from '../shared/Word'

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
    addSentence() {
        let fact = this.props.fact
        
        if (fact instanceof Word) {
            let sentence = new Sentence([ fact ], null)
            
            this.props.corpus.sentences.add(sentence)
            
            this.openSentence(sentence)
        }
    }

    openSentence(sentence: Sentence) {
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
    }

    openFact(fact: Fact) {
        this.props.tab.openTab(
            <FactComponent corpus={ this.props.corpus } fact={ fact } tab={ null }/>,
            fact.getId(),
            fact.getId()
        )
    }

    render() {
        let fact = this.props.fact
        
        let index : FactSentences =
            findSentencesForFact(fact, this.props.corpus.sentences, this.props.corpus.facts)
        
        let toSentence = (sentence) => {
            return <li 
                key={ sentence.id }
                className='clickable'
                onClick={ () => this.openSentence(sentence) }>{ sentence.toString() }</li>
        }

        let inflectionComponents = <div/>
        let wordsWithInflectionComponent = <div/>

        if (fact instanceof InflectedWord) {
            let inflections
            
            inflectionComponents =
                <div>
                    {
                        (fact.infinitive != fact ?
                        
                            <div className='formName'>
                                <span className='label'>form</span>&nbsp; 
                                { fact.form } of&nbsp; 
                                <span className='clickable name' onClick={ (e) => this.openFact(fact.infinitive) }>
                                    { fact.infinitive.toString() }
                                </span>
                            </div>
                            
                            :
                            
                            [])
                    }
                    <ChangeInflectionComponent
                        corpus={ this.props.corpus } 
                        tab={ this.props.tab }
                        word={ fact }
                        onChange={ () => inflections.forceUpdate() } />
                    <InflectionsComponent 
                        corpus={ this.props.corpus } 
                        inflection={ fact.inflection } 
                        word={ fact } 
                        tab={ this.props.tab }
                        ref={ (component) => inflections = component} />
                </div>
        }
        else if (fact instanceof InflectionFact) {
            inflectionComponents = <InflectionsComponent corpus={ this.props.corpus } 
                inflection={ fact.inflection } tab={ this.props.tab }  />

            wordsWithInflectionComponent = 
                <div>
                    <h3>Words</h3>
                    <WordsWithInflectionComponent corpus={ this.props.corpus } tab={ this.props.tab } 
                        inflection={ fact.inflection } form={ fact.form }/>
                </div>;
        }

        return (<div>

            { inflectionComponents }
        
            { fact instanceof Word ?

                <div className='buttonBar'>
                    <div className='button' onClick={ () => this.addSentence() }>Add sentence</div>
                </div>

                :

                <div/>
            }
        
            { wordsWithInflectionComponent }
            
            <h3>Easy</h3> 
            
            <ul>
            { index.easy.map(toSentence) }
            { index.ok.map(toSentence) }
            </ul>

            <h3>Hard</h3> 
            
            <ul>
            { index.hard.map(toSentence) }
            </ul>
        </div>)
    }
}
