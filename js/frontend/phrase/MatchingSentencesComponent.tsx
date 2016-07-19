/// <reference path="../../../typings/react/react.d.ts" />

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Tab from '../OpenTab'
import SentenceComponent from '../SentenceComponent'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import PhraseMatch from '../../shared/phrase/PhraseMatch'
import htmlEscape from '../../shared/util/htmlEscape'

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
    words: Word[]
}

export default class MatchingSentencesComponent extends Component<Props, State> {

    openSentence(sentence: Sentence) {
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
    }

    renderSentence(match: Match) {
        return <div className='main'>
            <div className='sentence clickable' 
                onClick={ () => this.openSentence(match.sentence) }
                dangerouslySetInnerHTML={ { __html: 
                match.sentence.innerToString((word, first) => {
                    let wordString = htmlEscape(word.toString())

                    if (match.words.indexOf(word) >= 0) {
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

        this.props.corpus.sentences.sentences.forEach((sentence) => {
            if (this.props.filter && !this.props.filter(sentence)) {
                return
            }

            let words = match.match(sentence.words, this.props.corpus.facts)

            if (words && words.length) {
                matches.push({
                    sentence: sentence,
                    words: words
                })
            }
        })

        return matches
    }

    render() {
        return <ul className='findPhraseSentences'>{ this.getMatches().map((match) => this.renderMatch(match)) }</ul>
    }
}
