

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

import { CASES, GrammaticalCase } from '../../../shared/inflection/InflectionForms'
import PhraseMatch from '../../../shared/phrase/PhraseMatch'

import { getFormName } from '../../../shared/inflection/InflectionForms' 
import InflectionFact from '../../../shared/inflection/InflectionFact'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import SentenceScore from '../../../shared/study/SentenceScore'
import KnowledgeSentenceSelector from '../../../shared/study/KnowledgeSentenceSelector'
import topScores from '../../../shared/study/topScores'
import Phrase from '../../../shared/phrase/Phrase'
import PhrasePattern from '../../../shared/phrase/PhrasePattern'
import Match from '../../../shared/phrase/Match'
import WordInFormMatch from '../../../shared/phrase/WordInFormMatch'
import ExactWordMatch from '../../../shared/phrase/ExactWordMatch'

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

import marked = require('marked')

import FactLinkComponent from './FactLinkComponent'

import renderRelatedFact from './renderRelatedFact'
import getPhraseSeoText from './getPhraseSeoText'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    phrase: Phrase,
    knowledge: NaiveKnowledge,
    factLinkComponent: FactLinkComponent
}

interface TokenizedSentence {
    sentence: Sentence,
    tokens: StudyToken[]
}

interface State {
}

export default class PhraseFactComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = { }
    }

    renderMatch(match: Match) {
        let wordIndexes = match.words.map((i) => i.index)

        return <li key={ match.sentence.id }>
            {
                React.createElement(this.props.factLinkComponent, { fact: match.sentence }, 
                    <span dangerouslySetInnerHTML={ { __html: 
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
                )
            }
            

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

        let factoid = corpus.factoids.getFactoid(phrase)

        let relations = dedup(this.props.phrase.getCases()
            .map(grammaticalCase => 
                this.props.corpus.facts.get(CASES[grammaticalCase]))
            .concat(
                (factoid ? 
                factoid.relations.map(f => corpus.facts.get(f.fact)).filter(f => !!f) 
                : 
                []))
            .concat(this.props.phrase.getWords().map(word => word.getWordFact())))
 
        let phraseSeoText = getPhraseSeoText(phrase)

        return <div>
            <h1>"{ phrase.description }"</h1>
            <h2>{ phrase.en } { phraseSeoText ? ' – ' + phraseSeoText : '' }</h2>
            {
                factoid ? 
                    <div className='factoid' 
                        dangerouslySetInnerHTML={ { __html: marked(factoid.explanation) } }/>
                :
                    null 
            }

            <div className='columns'>
                <div className='main'>
                    <h3>Examples of usage</h3>

                    <ul>{
                        matches.map(match => this.renderMatch(match))
                    }</ul>
                </div>
                <div className='sidebar'>
                    { relations.length ?
                        <div>
                            <h3>See also</h3>

                            <ul>
                            {
                                (this.props.phrase.required || [])
                                    .concat(relations)
                                    .map(fact => 
                                        renderRelatedFact(fact, corpus, this.props.factLinkComponent)) 
                            }
                            </ul>
                        </div>

                        : null
                    }
                </div>
            </div>
        </div>
    }
}

function dedup(facts: Fact[]) {
    let seen = {}

    return facts.filter(fact => {
        let result = !seen[fact.getId()]

        seen[fact.getId()] = true
        
        return result
    })
}
