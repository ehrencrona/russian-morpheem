/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import Sentence from '../shared/Sentence'

import { Component, createElement } from 'react';
import { MISSING_INDEX } from '../shared/fact/Facts'

import { findSentencesForFact, SentenceDifficulty, FactSentences } from '../shared/SentencesByFactIndex'
import Tab from './Tab'
import SentenceComponent from './SentenceComponent'

interface Props {
    corpus: Corpus,
    tab: Tab,
    fact: Fact
}

interface State {}

let React = { createElement: createElement }

export default class SentencesWithFactComponent extends Component<Props, State> {
    moveTo(toIndex: number) {
        if (toIndex < 1) {
            return
        }

        if (toIndex > this.props.corpus.facts.facts.length) {
            toIndex = this.props.corpus.facts.facts.length
        }

        let factIndex = this.props.corpus.facts.indexOf(this.props.fact) + 1;

        // move to puts it before the specified index, which is not what you expect.
        if (toIndex > factIndex) {
            toIndex++
        }

        this.props.corpus.facts.move(this.props.fact, toIndex-1);

        (this.refs['position'] as HTMLInputElement).value = 
            (this.props.corpus.facts.indexOf(this.props.fact) + 1).toString();


        this.forceUpdate()
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

        let index : FactSentences =
            findSentencesForFact(fact, this.props.corpus.sentences, this.props.corpus.facts)

        let toSentence = (sentence: SentenceDifficulty) => {
            return <li 
                key={ sentence.sentence.id }
                className='clickable'
                onClick={ () => this.openSentence(sentence.sentence) }>
                    <div className={ 'index' + (sentence.difficulty == MISSING_INDEX ? ' missing' : '') }>
                        <div className='number' >
                            { sentence.difficulty == MISSING_INDEX ? 'n/a' : sentence.difficulty + 1 }
                        </div>
                    </div>
                    { sentence.sentence.toString() }
                </li>
        }

        let byDifficulty = (s1: SentenceDifficulty, s2: SentenceDifficulty) => {
            return s1.difficulty - s2.difficulty
        }

        return (<div>
                    
            <h3>Easy</h3> 
            
            <ul className='sentencesWithFact'>
            { index.easy.sort(byDifficulty).map(toSentence) }
            { index.ok.sort(byDifficulty).map(toSentence) }
            </ul>

            <h3>Hard</h3> 
            
            <ul className='sentencesWithFact'>
            { index.hard.sort(byDifficulty).map(toSentence) }
            </ul>
        </div>);
    }
}
