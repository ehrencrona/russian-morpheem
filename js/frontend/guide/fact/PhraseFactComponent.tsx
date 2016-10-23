

import { Component, createElement } from 'react'

import Corpus from '../../../shared/Corpus'

import InflectedWord from '../../../shared/InflectedWord'
import InflectableWord from '../../../shared/InflectableWord'
import AbstractAnyWord from '../../../shared/AbstractAnyWord'
import Fact from '../../../shared/fact/Fact'
import { Knowledge } from '../../../shared/study/Exposure'

import Inflection from '../../../shared/inflection/Inflection'
import Ending from '../../../shared/Ending'
import Sentence from '../../../shared/Sentence'

import { getFormName } from '../../../shared/inflection/InflectionForms' 
import InflectionFact from '../../../shared/inflection/InflectionFact'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import SentenceScore from '../../../shared/study/SentenceScore'
import KnowledgeSentenceSelector from '../../../shared/study/KnowledgeSentenceSelector'
import topScores from '../../../shared/study/topScores'
import Phrase from '../../../shared/phrase/Phrase'
import Match from '../../../shared/phrase/Match'

import Transform from '../../../shared/Transform'
import { EndingTransform } from '../../../shared/Transforms'

import { Factoid } from '../../../shared/metadata/Factoids'
import htmlEscape from '../../../shared/util/htmlEscape'
import Words from '../../../shared/Words'
import Word from '../../../shared/Word'
import AnyWord from '../../../shared/AnyWord'

import StudyToken from '../../study/StudyToken'
import StudyWord from '../../study/StudyWord'
import StudyPhrase from '../../study/StudyPhrase'
import toStudyWords from '../../study/toStudyWords'

import StudyFact from '../../study/StudyFact'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    phrase: Phrase,
    knowledge: NaiveKnowledge,
    onSelectFact: (fact: Fact, context?: AnyWord) => any
}

interface TokenizedSentence {
    sentence: Sentence,
    tokens: StudyToken[]
}

interface State {
    factoid?: Factoid
    sentences?: TokenizedSentence[]
}

export default class PhraseFactComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = { }
    }

    renderRelatedFact(fact: Fact) {
        if (fact instanceof InflectableWord) {
            return <span>
                    { fact.toText() }
                    <div className='en'>{ fact.getEnglish()}</div>
                </span>
        }
        else if (fact instanceof Phrase) {
            return <span>{ fact.description }</span>
        }
        else {
            return null
        }
    }

    renderMatch(match: Match) {
        let wordIndexes = match.words.map((i) => i.index)

        return <li>
            <span 
                dangerouslySetInnerHTML={ { __html: 
                match.sentence.innerToString((word, first, index) => {
                    let wordString = htmlEscape(word.toString())

                    if (wordIndexes.indexOf(index) >= 0) {
                        return '<span class="match">' + wordString + '</span> ' 
                    }
                    else {
                        return wordString
                    }
                })
            } }/>

            <div className='en'>{
                match.sentence.en()
            }</div>
        </li>
    }

    render() {
        let phrase = this.props.phrase
        let corpus = this.props.corpus

        let sentences: Sentence[] = []
        let matchBySentenceId: Map<number, Match> = new Map()

        corpus.sentences.sentences.forEach((sentence) => {
            if (phrase.isAutomaticallyAssigned() || sentence.hasPhrase(phrase)) {
                let context = {
                    words: sentence.words,
                    sentence: sentence,
                    facts: corpus.facts,
                }

                let match = phrase.match(context)

                if (match) {
                    matchBySentenceId.set(sentence.id, match)
                    sentences.push(sentence)
                }
        }})

        let scores = sentences.map(sentence => 
            { 
                return {
                    sentence: sentence,
                    fact: phrase as Fact,
                    score: 1
                }    
            })

        scores = new KnowledgeSentenceSelector(this.props.knowledge).scoreSentences(scores)
        scores = topScores(scores, 6)

        let matches = scores.map(score => matchBySentenceId.get(score.sentence.id))

        return <div className='columns'>
            <div className='main'>
                <h3>Examples of use</h3>

                <ul>{
                    matches.map(match => this.renderMatch(match))
                }</ul>
            </div>
            <div className='sidebar'>
                { this.state.factoid && this.state.factoid.relations.length ?
                    <div>
                        <h3>See also</h3>

                        <ul>
                        {
                            this.state.factoid.relations.map(f => {
                                let fact = corpus.facts.get(f.fact)                            

                                return <li className='clickable' key={ f.fact } onClick={ (e) => {
                                            this.props.onSelectFact(fact)
                                            e.stopPropagation()
                                        }
                                    } >{ 
                                    this.renderRelatedFact(fact) 
                                }</li>
                            }) 
                        }
                        </ul>
                    </div>

                    : null
                }
            </div>
        </div>
    }
}