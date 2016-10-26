

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Tab from '../OpenTab'
import SentenceComponent from '../sentence/SentenceComponent'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import htmlEscape from '../../shared/util/htmlEscape'

import openSentence from '../sentence/openSentence'

import { Component, createElement, ReactElement } from 'react';

interface Props {
    corpus: Corpus
    id: number
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

export default class SentenceIdSearchComponent extends Component<Props, State> {

    renderSentence(sentence: Sentence) {
        return <div className='main'>
            <div className='sentence clickable' 
                onClick={ () => openSentence(sentence, this.props.corpus, this.props.tab) }>
                { sentence.toString() }
            </div>
        </div>
    }

    getMatch() {
        return this.props.corpus.sentences.get(this.props.id)
    }

    render() {
        let match = this.getMatch()

        return <div>
            <ul className='matchingSentences'>{
                match ? this.renderSentence(match) : [] 
            }</ul>
        </div>
    }
}
