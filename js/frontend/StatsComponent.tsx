

import {Component,createElement} from 'react'
import Corpus from '../shared/Corpus'
import Word from '../shared/Word'
import InflectableWord from '../shared/InflectableWord'
import Tab from './Tab'
import SentencesByDateComponent from './metadata/SentencesByDateComponent'

import { SentencesByFactIndex, DESIRED_SENTENCE_COUNT } from '../shared/SentencesByFactIndex'

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

        let indexOfFacts: SentencesByFactIndex =
            this.props.corpus.sentences.getSentencesByFact(this.props.corpus.facts)

        let factsWithEnoughSentences = 0, wordsWithEnoughSentences = 0
        let factsWithEnoughEasySentences = 0, wordsWithEnoughEasySentences = 0
        let words = 0

        for (let fact of corpus.facts.facts) {
            let i = indexOfFacts[fact.getId()]

            if (i && i.count >= DESIRED_SENTENCE_COUNT) {
                factsWithEnoughSentences++

                if (fact instanceof Word || fact instanceof InflectableWord) {
                    wordsWithEnoughSentences++
                }
            }
            
            if (i && i.easy.length + i.ok.length >= DESIRED_SENTENCE_COUNT) {
                factsWithEnoughEasySentences++

                if (fact instanceof Word || fact instanceof InflectableWord) {
                    wordsWithEnoughEasySentences++
                }
            }

            if (fact instanceof Word || fact instanceof InflectableWord) {
                words++
            }
        }

        let translated = 0

        corpus.sentences.sentences.forEach(sentence => {
            if (sentence.en() && sentence.en().trim()) {
                translated++
            }
        })

        return <ul className='stats'>
            <li>
                <b>{ corpus.sentences.sentences.length }</b> sentences, <b>{ translated }</b> translated
            </li>
            <li>
                <b>{ corpus.facts.facts.length }</b> facts (<b>{ words }</b> words)
            </li>
            <li> 
                <b>{ factsWithEnoughSentences }</b> facts (<b>{ wordsWithEnoughSentences }</b> words) have enough sentences
            </li>
            <li> 
                <b>{ factsWithEnoughEasySentences }</b> facts (<b>{ wordsWithEnoughEasySentences }</b> words) have enough easy sentences
            </li>

            <SentencesByDateComponent
                corpus={ this.props.corpus }/>
        </ul>
    }        
}
