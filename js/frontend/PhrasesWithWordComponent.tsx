/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import InflectableWord from '../shared/InflectableWord'
import InflectedWord from '../shared/InflectedWord'
import ExactWordMatch from '../shared/phrase/ExactWordMatch'

import Tab from './OpenTab'
import Word from '../shared/Word'
import Phrase from '../shared/phrase/Phrase'
import openFact from './fact/openFact'

import { Component, createElement } from 'react';

export type AnyWord = InflectableWord | Word

interface Props {
    corpus: Corpus
    word: AnyWord
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class PhrasesWithWordComponent extends Component<Props, State> {

    render() {

        let phrases: Phrase[] = this.props.corpus.phrases.all().filter((phrase) => 
            !!phrase.patterns.find((pattern) => 
                !!pattern.wordMatches.find((wordMatch) => 
                    wordMatch instanceof ExactWordMatch && 
                    wordMatch.word.getId() == this.props.word.getId())
            )
        )

        if (!phrases.length) {
            return <div/>
        }

        return <div>
            <h3>Phrases</h3>

            <div className='wordsWithInflection'>
            {
                phrases.map((phrase) => {            
                    let index = this.props.corpus.facts.indexOf(phrase);

                    return <div key={ phrase.getId() } className='clickable' onClick={ () => openFact(phrase, this.props.corpus, this.props.tab) }>
                        <div className='index'><div className='number'>{ index + 1 }</div></div>
                        { phrase.description }
                    </div>
                })            
            }
            </div>
        </div>
    }
    
}