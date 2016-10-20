

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

import Transform from '../../../shared/Transform'
import { EndingTransform } from '../../../shared/Transforms'

import { Factoid } from '../../../shared/metadata/Factoids'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    word: AbstractAnyWord,
    knowledge: NaiveKnowledge,
    onSelect: (word: InflectedWord) => void
}

interface State {
    factoid?: Factoid
    sentences?: Sentence[]
}

export default class WordFactComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = { }
    }

    componentWillMount() {
        let corpus = this.props.corpus

        let fact = this.props.word.getWordFact()

        corpus.factoids.getFactoid(fact)
            .then(factoid => this.setState({ factoid: factoid } ))

        let sentences = corpus.sentences.getSentencesByFact(corpus.facts)[ fact.getId() ]

        let scores = sentences.easy.concat(sentences.ok).concat(sentences.hard).map(ss => 
            { 
                return {
                    sentence: ss.sentence,
                    fact: fact,
                    score: 1
                }    
            })

        scores = new KnowledgeSentenceSelector(this.props.knowledge).scoreSentences(scores)

        scores = topScores(scores, 6)

        this.setState({
            sentences: scores.map(s => s.sentence)
        })
    } 

    render() {
        let word = this.props.word

        return <div>
            <div> 
                { this.state.factoid ? this.state.factoid.explanation : '' }
            </div>

            <ul>
                {
                    (this.state.sentences || []).map(sentence => 
                        <li key={ sentence.id }>{ sentence.toString() }
                            <div><i>{ sentence.en() }</i></div>
                        </li>
                    )
                }
            </ul>
        </div>
    }
}