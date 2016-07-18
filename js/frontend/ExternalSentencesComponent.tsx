/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import { MISSING_INDEX } from '../shared/fact/Facts'
import Sentence from '../shared/Sentence'
import UnstudiedWord from '../shared/UnstudiedWord'
import { ExternalSentence } from '../shared/external/ExternalSentence'
import { parseSentenceToWords, ParsedWord } from '../shared/external/parseSentenceToWords'

import { Component, createElement } from 'react';

import SentenceComponent from './SentenceComponent'
import Tab from './OpenTab'

interface Props {
    corpus: Corpus,
    fact: Fact,
    tab: Tab
}

interface State {
    complete: ParsedSentence[],
    incomplete: ParsedSentence[]
}

interface ParsedSentence {
    words: ParsedWord[],
    sentence: ExternalSentence,
    difficulty: number
}

let React = { createElement: createElement }

function isComplete(parsed: ParsedSentence) {
    return !parsed.words.find((word) => typeof word == 'string')
}

export default class ExternalSentencesComponent extends Component<Props, State> {
    getDifficulty(words: ParsedWord[]) {
        let facts = this.props.corpus.facts

        let result = 0

        words.forEach((word) => {
            if (typeof word != 'string') {
                let wordAlternatives = word as UnstudiedWord[]

                wordAlternatives.forEach((wordAlternative) => {
                    wordAlternative.visitFacts((fact) => {
                        let i = facts.indexOf(fact)

                        if (i > result) {
                            result = i
                        }
                    })
                })
            }
        })

        return result
    }

    componentDidMount() {
        this.props.corpus.externalCorpus.getExternalSentences(this.props.fact).then((sentences) => {

            let parsed = sentences.map((sentence) => {
                let words = parseSentenceToWords(sentence, this.props.corpus)

                return {
                    sentence: sentence,
                    words: words,
                    difficulty: this.getDifficulty(words)
                }
            }).sort((s1, s2) => s1.difficulty - s2.difficulty)

            this.setState({
                complete: parsed.filter((parsed) => isComplete(parsed)),
                incomplete: parsed.filter((parsed) => !isComplete(parsed))
            })

        })
    }

    importSentence(externalSentence: ExternalSentence) {
        this.props.corpus.externalCorpus.importSentence(externalSentence)
        .then((sentence) => {
            this.setState({
                complete: this.state.complete.filter((s) => s.sentence.id != externalSentence.id),
                incomplete: this.state.incomplete.filter((s) => s.sentence.id != externalSentence.id)
            })

            this.props.tab.openTab(
                <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
                sentence.toString(),
                sentence.id.toString()
            )
        })
    }

    render() {
        if (!this.state) {
            return <div/>
        }

        let sentenceToComponent = (sentence: ParsedSentence) => {
            return <li key={ sentence.sentence.id } className='externalSentence'>
                <div className={ 'index' + (sentence.difficulty == MISSING_INDEX ? ' missing' : '') }>
                    <div className='number' >
                        { sentence.difficulty == MISSING_INDEX ? 'n/a' : sentence.difficulty + 1 }
                    </div>
                </div>

                <div className='button' onClick={ () => this.importSentence(sentence.sentence) } >Add</div>
                
                <div className='main'>
                    <div className='sentence'>{
                        sentence.words.map((word: ParsedWord, index) => {
                            if (typeof word == 'string') {
                                return <span key={ index } className='missing'>{ word }</span>
                            }
                            else {
                                let anyMatch = false
                                let allMatch = true

                                let potentialWords = word as UnstudiedWord[];

                                potentialWords.forEach((uw) => {
                                    let thisMatch = false

                                    uw.visitFacts((fact) => {
                                        if (fact.getId() == this.props.fact.getId()) {
                                            thisMatch = true
                                        }
                                    })

                                    allMatch = allMatch && thisMatch
                                    anyMatch = anyMatch || thisMatch
                                })

                                let uw = potentialWords[0] 

                                if (anyMatch) {
                                    return <span key={ index } className={ 'match' + (!allMatch ? ' ambiguous' : '' ) }>
                                        { uw.toString() }
                                    </span>
                                }
                                else {
                                    return <span key={ index }>{ uw.toString() }</span>
                                }
                            }
                        })
                    }</div>

                    <div className="en">{ sentence.sentence.en }</div>
                </div>
            </li>
        }

        return (<div>
            <h3>Complete</h3>
            <ul>
            {
                this.state.complete.map((sentence) => sentenceToComponent(sentence))
            }
            </ul>
            <h3>Words missing</h3>
            <ul>
            {
                this.state.incomplete.map((sentence) => sentenceToComponent(sentence))
            }
            </ul>
        </div>);
    }
}
