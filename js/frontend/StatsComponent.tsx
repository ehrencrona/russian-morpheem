/// <reference path="../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../shared/Corpus'
import Word from '../shared/Word'
import InflectableWord from '../shared/InflectableWord'
import Tab from './Tab'
import SentencesByDateComponent from './metadata/SentencesByDateComponent'

import PendingSentencesComponent from './metadata/PendingSentencesComponent'

import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

export default class StatsComponent extends Component<Props, State> {
    
    render() {
        let corpus = this.props.corpus 

        let indexOfFacts : { [factId: string]: FactSentenceIndex } =
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        let factsWithEnoughSentences = 0, wordsWithEnoughSentences = 0
        let words = 0

        for (let fact of corpus.facts.facts) {
            let i = indexOfFacts[fact.getId()]

            if (i && i.easy + i.ok >= 8) {
                factsWithEnoughSentences++

                if (fact instanceof Word || fact instanceof InflectableWord) {
                    wordsWithEnoughSentences++
                }
            }
            
            if (fact instanceof Word || fact instanceof InflectableWord) {
                words++
            }
        }

        return <ul className='stats'>
            <li>
                <b>{ corpus.sentences.sentences.length }</b> sentences
            </li>
            <li>
                <b>{ corpus.facts.facts.length }</b> facts (<b>{ words }</b> words)
            </li>
            <li> 
                <b>{ factsWithEnoughSentences }</b> facts (<b>{ wordsWithEnoughSentences }</b> words) have enough sentences
            </li>

            <SentencesByDateComponent
                corpus={ this.props.corpus }/>

            <PendingSentencesComponent
                corpus={ this.props.corpus } 
                tab={ this.props.tab } />
        </ul>
    }        
}
