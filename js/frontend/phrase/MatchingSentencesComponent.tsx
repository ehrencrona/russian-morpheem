/// <reference path="../../../typings/react/react.d.ts" />

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Tab from '../OpenTab'
import SentenceComponent from '../SentenceComponent'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import PhraseMatch from '../../shared/phrase/PhraseMatch'
import htmlEscape from '../../shared/util/htmlEscape'

import openSentence from '../sentence/openSentence'

import { MISSING_INDEX } from '../../shared/fact/Facts'
import { Component, createElement, ReactElement } from 'react';

interface Props {
    corpus: Corpus
    match: PhraseMatch
    filter?: (sentence: Sentence) => boolean
    tab: Tab
    buttonFactory?: (sentence: Sentence) => ReactElement<any>
}

interface State {
}

let React = { createElement: createElement }

interface Match {
    sentence: Sentence,
    wordIndexes: number[]
}

export default class MatchingSentencesComponent extends Component<Props, State> {

    renderSentence(match: Match) {
        return <div className='main'>
            <div className='sentence clickable' 
                onClick={ () => openSentence(match.sentence, this.props.tab) }
                dangerouslySetInnerHTML={ { __html: 
                match.sentence.innerToString((word, first, index) => {
                    let wordString = htmlEscape(word.toString())

                    if (match.wordIndexes.indexOf(index) >= 0) {
                        return '<span class="match">' + wordString + '</span>' 
                    }
                    else {
                        return wordString
                    }
                })
            } }/>
        </div>
    }

    renderMatch(match: Match) {
        let difficulty = 0

        return <li 
            key={ match.sentence.id }
            className='sentenceWithButton'>
                {
                    (this.props.buttonFactory ? this.props.buttonFactory(match.sentence) : <div/>)
                }
                { this.renderSentence(match) }
            </li>
    }

    getMatches() {
        let match = this.props.match
        let matches: Match[] = []

        if (!match) {
            return matches
        }

        this.props.corpus.sentences.sentences.forEach((sentence) => {
            if (this.props.filter && !this.props.filter(sentence)) {
                return
            }

            let wordIndexes = match.match(sentence.words, this.props.corpus.facts)

            if (wordIndexes && wordIndexes.length) {
                matches.push({
                    sentence: sentence,
                    wordIndexes: wordIndexes
                })
            }
        })

        return matches
    }

    render() {
        return <ul className='findPhraseSentences'>{ this.getMatches().map((match) => this.renderMatch(match)) }</ul>
    }
}
