

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Tab from '../OpenTab'
import SentenceComponent from '../sentence/SentenceComponent'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import PhrasePattern from '../../shared/phrase/PhrasePattern'
import Phrase from '../../shared/phrase/Phrase'
import htmlEscape from '../../shared/util/htmlEscape'

import openSentence from '../sentence/openSentence'

import { MISSING_INDEX } from '../../shared/fact/Facts'
import { Component, createElement, ReactElement } from 'react';

interface Props {
    corpus: Corpus
    patterns: PhrasePattern[]
    filter?: (sentence: Sentence) => boolean
    isConflict?: (sentence: Sentence, matchWordIndexes: number[]) => boolean
    includeConflicts?: boolean
    noMatchIsConflict?: boolean
    tab: Tab
    buttonFactory?: (sentence: Sentence) => ReactElement<any>
    limit?: number
}

interface State {
}

let React = { createElement: createElement }

interface Match {
    sentence: Sentence,
    wordIndexes: number[],
    conflict: boolean
}

export default class PhraseSentencesComponent extends Component<Props, State> {

    renderSentence(match: Match) {
        return <div className='main'>
            <div className='sentence clickable' 
                onClick={ () => openSentence(match.sentence, this.props.corpus, this.props.tab) }
                dangerouslySetInnerHTML={ { __html: 
                match.sentence.innerToString((word, first, index) => {
                    let wordString = htmlEscape(word.toString())

                    if (match.wordIndexes.indexOf(index) >= 0) {
                        return '<span class="match">' + wordString + '</span> ' 
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
            className={ 'sentenceWithButton' + (match.conflict ? ' conflict' : '') }>
                {
                    (this.props.buttonFactory ? this.props.buttonFactory(match.sentence) : <div/>)
                }
                { this.renderSentence(match) }
            </li>
    }

    getMatches() {
        let facts = this.props.corpus.facts
        let patterns = this.props.patterns
        let isConflict = this.props.isConflict 

        let matches: Match[] = []

        if (!patterns.length) {
            return matches
        }

        let limit = this.props.limit

        this.props.corpus.sentences.sentences.forEach((sentence) => {
            if (limit && matches.length >= limit) {
                return
            }

            if (this.props.filter && !this.props.filter(sentence)) {
                return
            }
            
            let match
            
            for (let i = 0; i < patterns.length; i++) {
                match = patterns[i].match({ sentence: sentence, words: sentence.words, facts: facts })

                if (match) {
                    break
                }
            }

            if (match) {
                let wordIndexes = match.words.map((i) => i.index)
                let conflict = isConflict && isConflict(sentence, wordIndexes)

                if (!conflict || this.props.includeConflicts) {
                    matches.push({
                        sentence: sentence,
                        wordIndexes: wordIndexes,
                        conflict: conflict
                    })
                }
            }
            else if (this.props.noMatchIsConflict && this.props.includeConflicts) {
                matches.push({
                    sentence: sentence,
                    wordIndexes: [],
                    conflict: true
                })
            }
        })

        return matches
    }

    render() {
        let matches = this.getMatches()

        return <div>
            <ul className='matchingSentences'>{ matches.map((match) => this.renderMatch(match)) }</ul>
            { matches.length >= this.props.limit ? `Limited to ${this.props.limit} matches.` : ''}
        </div>
    }
}
