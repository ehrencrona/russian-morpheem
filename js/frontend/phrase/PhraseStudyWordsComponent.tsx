

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'
import PhraseCase from '../../shared/phrase/PhraseCase'
import PhrasePattern from '../../shared/phrase/PhrasePattern'

import toStudyWords from '../study/toStudyWords'
import StudyToken from '../study/StudyToken'
import StudyWord from '../study/StudyWord'
import StudyPhrase from '../study/StudyPhrase'
import openSentence from '../sentence/openSentence'
import Tab from '../OpenTab'

import { Component, createElement } from 'react'

interface Props {
    corpus: Corpus
    phrase: Phrase
    tab: Tab
    pattern: PhrasePattern
}

interface State {
    limit: number
}

let React = { createElement: createElement }

const LESS = 3
const MORE = 30

export default class PhraseStudyWordsComponent extends Component<Props, State> {

    constructor(props) {
        super(props)

        this.state = { limit: LESS }
    }

    render() {

        let findAFew = (array: Sentence[], filter: (sentence: Sentence) => boolean) => {
            let result = []

            for (let i = 0; i < array.length && result.length < this.state.limit; i++) {

                if (filter(array[i])) {
                    result.push(array[i])
                }

            }

            return result
        }

        let phrase = this.props.phrase
        let pattern: PhrasePattern = this.props.pattern

        let firstMatchingPattern = (sentence: Sentence) => {
            return phrase.patterns.find((pattern) => pattern.match({ 
                sentence: sentence, words: sentence.words, facts: this.props.corpus.facts }) != null)
        }

        let words: StudyToken[] = []
        let sentences: Sentence[]

        if (phrase.patterns.length) {
            sentences = findAFew(this.props.corpus.sentences.sentences, (sentence) => {
                return !!sentence.phrases.find((p) => p.getId() == phrase.getId() && 
                    firstMatchingPattern(sentence) == pattern)
            })

            if (!sentences.length) {
                sentences = findAFew(this.props.corpus.sentences.sentences, (sentence) => {
                    return firstMatchingPattern(sentence) == pattern 
                })
            }
        }

        let error: string 

        return <div className='phraseStudyWords'>
            <div className='field'>
                <div className='label'>
                    Pattern
                </div>
                {
                    sentences.length ?
                    (

                        <ul> { 
                            sentences.map(sentence => {
                                let phraseWithOnePattern = new Phrase(phrase.getId(), [ pattern ])
                                phraseWithOnePattern.setCorpus(this.props.corpus)

                                words = toStudyWords(sentence, [ phraseWithOnePattern ], this.props.corpus, true)

                                return <li key={ sentence.id } className='clickable' onClick={ () => openSentence(sentence, this.props.corpus, this.props.tab) } > { 
                                    words.map((w, index) => 
                                        (w instanceof StudyPhrase ?
                                            <span className='match' key={ index }> { w.getHint() }</span> 
                                            :
                                            <span key={ index }>{ w.jp }</span>)
                                ) }</li>
                            })
                        }</ul>

                    )

                    :

                    (
                        error ? 
                        <div className='error'>{ error }</div> :
                        <div/>
                    )

                }

                {
                    this.state.limit == LESS ?

                    ( sentences.length >= LESS ?

                        <div className='clickable' onClick={ () => this.setState({ limit: MORE }) }>More...</div>

                        :

                        <div/>)

                    : 

                    <div className='clickable' onClick={ () => this.setState({ limit: LESS }) }>Less...</div>
                }
            </div>
        </div>
    }
}
