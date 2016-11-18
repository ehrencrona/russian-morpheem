

import Corpus from '../shared/Corpus'
import AnyWord from '../shared/AnyWord'
import Fact from '../shared/fact/Fact'

import InflectableWord from '../shared/InflectableWord'
import InflectedWord from '../shared/InflectedWord'
import ExactWordMatch from '../shared/phrase/ExactWordMatch'
import WordInFormMatch from '../shared/phrase/WordInFormMatch'
import findPhrasesWithWord from '../shared/phrase/findPhrasesWithWord'

import Tab from './OpenTab'
import Word from '../shared/Word'
import Phrase from '../shared/phrase/Phrase'
import openFact from './fact/openFact'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus
    word: AnyWord
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class PhrasesWithWordComponent extends Component<Props, State> {

    render() {

        let phrases: Phrase[] = findPhrasesWithWord(this.props.word, this.props.corpus)

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