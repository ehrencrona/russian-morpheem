/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import InflectedWord from '../shared/InflectedWord'
import InflectionFact from '../shared/InflectionFact'

import Tab from './Tab'
import FactComponent from './FactComponent'
import SentenceComponent from './SentenceComponent'
import InflectionsComponent from './InflectionsComponent'
import ChangeInflectionComponent from './ChangeInflectionComponent'
import MoveFactButton from './MoveFactButtonComponent'
import WordsWithInflectionComponent from './WordsWithInflectionComponent'
import SentencesWithFact from './SentencesWithFactComponent';

import Sentence from '../shared/Sentence'
import InflectableWord from '../shared/InflectableWord'

import { Component, createElement } from 'react';
import { findSentencesForFact, FactSentences } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    fact: InflectableWord,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class WordFactComponent extends Component<Props, State> {
    addSentence() {
        let fact = this.props.fact
        
        let sentence = new Sentence([ fact.inflect(fact.inflection.defaultForm) ], null)

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

    openFact(fact: Fact) {
        this.props.tab.openTab(
            <FactComponent corpus={ this.props.corpus } fact={ fact } tab={ null }/>,
            fact.getId(),
            fact.getId()
        )
    }

    render() {
        let fact = this.props.fact
        let inflections
        
        let inflectionComponents =
            <div>                            
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

        return (<div>

            <div className='buttonBar'>
                <div className='button' onClick={ () => this.addSentence() }>Add sentence</div>

                <MoveFactButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>
        
            { inflectionComponents }
            
            <SentencesWithFact corpus={ this.props.corpus} fact={ this.props.fact } tab={ this.props.tab } />
        </div>)
    }
}
