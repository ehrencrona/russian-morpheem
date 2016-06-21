/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import Sentence from '../shared/Sentence'
import UnstudiedWord from '../shared/UnstudiedWord'
import { ExternalSentence } from '../shared/external/ExternalSentence'
import { parseSentenceToWords, ParsedWord } from '../shared/external/parseSentenceToWords'

import { Component, createElement } from 'react';

import SentenceComponent from './SentenceComponent'

interface Props {
    corpus: Corpus,
    fact: Fact
}

interface State {
    sentences: ParsedSentence[]
}

interface ParsedSentence {
    words: ParsedWord[],
    sentence: ExternalSentence
}

let React = { createElement: createElement }

export default class ExternalSentencesComponent extends Component<Props, State> {
    componentDidMount() {
        this.props.corpus.externalCorpus.getExternalSentences(this.props.fact).then((sentences) => 
            this.setState({
                sentences:
                    sentences.map((sentence) => {
                        return {
                            sentence: sentence,
                            words: parseSentenceToWords(sentence, this.props.corpus)
                        }
                    })
            })
        )
    }

    render() {
        if (!this.state) {
            return <div/>
        }

        return (<div>
            <h3>Tatoeba</h3>            
            <ul>
            {
                this.state.sentences.map((sentence) => 
                    <li key={ sentence.sentence.id } className='externalSentence'>
                        <div className='sentence'>{ 
                            sentence.words.map((word: ParsedWord, index) => {
                                if (typeof word == 'string') {
                                    return <span key={ index } className='missing'>{ word }</span>
                                }
                                else {
                                    let uw = (word as UnstudiedWord[])[0]
                                    let match = false

                                    uw.visitFacts((fact) => {
                                        if (fact.getId() == this.props.fact.getId()) {
                                            match = true
                                        }
                                    })

                                    if (match) {
                                        return <span key={ index } className='match'>{ uw.toString() }</span>
                                    }
                                    else {
                                        return <span key={ index }>{ uw.toString() }</span>
                                    }
                                }
                            })
                        }</div>

                        <div><i>{ sentence.sentence.en }</i></div>
                    </li>
                )
            }
            </ul>
        </div>);
    }
}
