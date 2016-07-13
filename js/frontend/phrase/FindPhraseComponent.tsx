/// <reference path="../../../typings/react/react.d.ts" />

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Tab from '../Tab'
import MoveFactButton from '../MoveFactButtonComponent'
import TagButton from '../TagButtonComponent'
import SentencesWithFact from '../SentencesWithFactComponent';
import SentenceComponent from '../SentenceComponent'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'
import htmlEscape from '../../shared/util/htmlEscape'

import { MISSING_INDEX } from '../../shared/fact/Facts'
import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    phrase: Phrase,
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

interface Match {
    sentence: Sentence,
    words: Word[]
}

export default class FindPhraseComponent extends Component<Props, State> {

    openSentence(sentence: Sentence) {
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
    }

    renderMatch(match: Match) {
        let difficulty = 0

        return <li 
            key={ match.sentence.id }
            className='clickable'
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
            } }>
            </li>
    }

    render() {

        let phrase = this.props.phrase

        let matches: Match[] = []

        this.props.corpus.sentences.sentences.forEach((sentence) => {
            let words = phrase.match(sentence.words, this.props.corpus.facts)

            if (words && words.length) {
                matches.push({
                    sentence: sentence,
                    words: words
                })
            }
        })

        return <ul className='findPhraseSentences'>{ matches.map((match) => this.renderMatch(match)) }</ul>
    }
}
