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
import TagButton from './TagButtonComponent'
import WordsWithInflectionComponent from './WordsWithInflectionComponent'
import SentencesWithFact from './SentencesWithFactComponent';

import Sentence from '../shared/Sentence'
import Word from '../shared/Word'

import { Component, createElement } from 'react';
import { findSentencesForFact, FactSentences } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    fact: Word,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class WordFactComponent extends Component<Props, State> {
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

    render() {
        let fact = this.props.fact

        return (<div>

            <div className='buttonBar'>
                <div className='button' onClick={ () => this.addSentence() }>Add sentence</div>

                <MoveFactButton corpus={ this.props.corpus} fact={ this.props.fact } />
                <TagButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>
            
            <SentencesWithFact corpus={ this.props.corpus} fact={ this.props.fact } tab={ this.props.tab } />
        </div>)
    }
}
