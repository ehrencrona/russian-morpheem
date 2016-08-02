/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'
import OldestSentenceSelector from '../../shared/study/OldestSentenceSelector'
import LastSawSentenceKnowledge from '../../shared/study/LastSawSentenceKnowledge'
import chooseHighestScoreSentence from '../../shared/study/chooseHighestScoreSentence'
import createNewFactsSelector from '../../shared/study/NewFactsSelector'
import FactScore from '../../shared/study/FactScore'

import FixedIntervalFactSelectorInspectorComponent from './FixedIntervalFactSelectorInspectorComponent'
import SentenceComponent from '../SentenceComponent'
import SentenceHistoryComponent from '../metadata/SentenceHistoryComponent'

import sentencesForFacts from '../../shared/study/sentencesForFacts'
import topScores from '../../shared/study/topScores'

import { indexSentencesByFact, SentencesByFactIndex } from '../../shared/SentencesByFactIndex'

import InflectionFact from '../../shared/inflection/InflectionFact'
import Sentence from '../../shared/Sentence'

import Exposure from '../../shared/study/Exposure'
import FrontendExposures from './FrontendExposures'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import Word from '../../shared/Word'

import StudyComponent from './StudyComponent'
import TrivialKnowledge from '../../shared/study/TrivialKnowledge'
import KnowledgeSentenceSelector from '../../shared/study/KnowledgeSentenceSelector'

import ExplainFormComponent  from './ExplainFormComponent'
import ForgettingStats from './ForgettingStats'

import Phrase from '../../shared/phrase/Phrase'
import PhraseCase from '../../shared/phrase/PhraseCase'
import { GrammaticalCase } from '../../shared/inflection/InflectionForms'


interface Props {
    corpus: Corpus,
    xrArgs: { [arg: string] : string }
}

interface State {
    sentence?: Sentence
    fact?: Fact
    showDecks?: boolean
    showComments?: boolean
    edit?: boolean
}

let React = { createElement: createElement }


function isWorthStudying(fact: Fact) {
    if (fact instanceof InflectionFact) {
        return fact.form != fact.inflection.defaultForm
    }
    else if (fact instanceof Word || fact instanceof InflectableWord) {
        return fact.studied
    }
    else {
        return true
    }
}

export default class StudyContainerComponent extends Component<Props, State> {
    exposures: FrontendExposures
    knowledge: NaiveKnowledge
    sentenceKnowledge: LastSawSentenceKnowledge
    trivialKnowledge: TrivialKnowledge
    sentencesByFactIndex: SentencesByFactIndex 
    factSelector: FixedIntervalFactSelector
    newFactsSelector: () => FactScore[]

    forgettingStats: ForgettingStats

    constructor(props) {
        super(props)

        this.state = {}

        this.sentencesByFactIndex = indexSentencesByFact(props.corpus.sentences, props.corpus.facts, 0)
        this.factSelector = new FixedIntervalFactSelector(this.props.corpus.facts)
        this.knowledge = new NaiveKnowledge()
        this.trivialKnowledge = new TrivialKnowledge()
        this.newFactsSelector = createNewFactsSelector(this.props.corpus.facts, this.knowledge, this.factSelector, 0.1, 10)
        this.exposures = new FrontendExposures(this.props.xrArgs, this.props.corpus.lang)
        this.sentenceKnowledge = new LastSawSentenceKnowledge()
        this.forgettingStats = new ForgettingStats(this.props.corpus)
    }

    chooseSentence() {
        let factScores = this.factSelector.chooseFact(new Date())

        factScores = factScores.concat(this.newFactsSelector())

        factScores = factScores.filter((fs) => {
            let fact = fs.fact 

            return isWorthStudying(fact)
        })

        factScores = topScores(factScores, 20)

        let sentenceScores = sentencesForFacts(factScores, this.sentencesByFactIndex)

        sentenceScores = new OldestSentenceSelector(this.sentenceKnowledge, this.props.corpus.facts)
            .scoreSentences(sentenceScores)

        sentenceScores = topScores(sentenceScores, 100)

        sentenceScores = new KnowledgeSentenceSelector(this.knowledge).scoreSentences(sentenceScores)
/*
factScores = [ { 		
    fact: this.props.corpus.facts.get('этот'),
    score: 1
} ]

sentenceScores = [{
    sentence: this.props.corpus.sentences.get(4954),
    score: 1,
    fact: factScores[0].fact,
    debug: {}
}]
*/
        // if studying phrases, remove any sentences that don't actually match the phrase.
        sentenceScores = sentenceScores.filter((score) => {
            let phrase: Phrase
            let fact = score.fact

            if (fact instanceof Phrase) {
                phrase = fact
            }
            
            if (fact instanceof PhraseCase) {
                phrase = fact.phrase
            }

            if (phrase && !phrase.match(score.sentence.words, this.props.corpus.facts)) {
                console.log(score.sentence + ' did not match phrase ' + phrase)
                return false
            }
            else {
                return true
            }
        })


        let sentenceScore = chooseHighestScoreSentence(sentenceScores)

        if (!sentenceScore) {
            throw new Error('No sentence could be picked.')
        }

        let sentence = sentenceScore.sentence
        let fact = sentenceScore.fact

        console.log(sentenceScore)

        this.setState({ sentence: sentence, fact: fact })
    }

    componentWillMount() {
        this.exposures
            .getExposures(-1)
            .then((exposures) => {
                this.processExposures(exposures)

                this.chooseSentence()
            })
    }

    processExposures(exposures: Exposure[]) {
        this.knowledge.processExposures(exposures)
        this.sentenceKnowledge.processExposures(exposures)
        this.trivialKnowledge.processExposures(exposures)
        this.forgettingStats.processExposures(exposures)
        this.factSelector.processExposures(exposures)

//        this.forgettingStats.print()
    }

    onAnswer(exposures: Exposure[]) {
        this.exposures.registerExposures(exposures)
        this.processExposures(exposures)

        this.chooseSentence()
    }

    render() {
        if (this.state.sentence) {
            return <div className='study'>
                <StudyComponent 
                    sentence={ this.state.sentence }
                    fact={ this.state.fact }
                    factSelector={ this.factSelector } 
                    corpus={ this.props.corpus }
                    knowledge={ this.knowledge }
                    trivialKnowledge={ this.trivialKnowledge }
                    onAnswer={ (exposures) => this.onAnswer(exposures)} />            


                {
                    (this.state.showComments ?

                    <div>
                        <div className='debugButtonBar'>
                            <div className='button' onClick={ () => this.setState({ showComments: false }) }>Close</div>
                        </div>

                        <SentenceHistoryComponent 
                            corpus={ this.props.corpus }
                            sentence={ this.state.sentence }
                            commentBoxOpen={ true }
                            />
                    </div>
                        
                        :

                    <div/>)
                }

                {
                    (this.state.edit ?

                    <div>
                        <div className='debugButtonBar'>
                            <div className='button' onClick={ () => this.setState({ edit: false }) }>Close</div>
                        </div>

                        <SentenceComponent 
                            corpus={ this.props.corpus }
                            sentence={ this.state.sentence }
                            tab={ { openTab: () => {}, close: () => {}, getLastTabIds: () => [] } }
                            />
                    </div>
                        
                        :

                    <div/>)
                }

                {
                    (this.state.showDecks ?

                        <div>

                            <div className='debugButtonBar'>
                                <div className='button' onClick={ () => this.setState({ showDecks: false }) }>Close</div>
                            </div>

                            <FixedIntervalFactSelectorInspectorComponent 
                                knowledge={ this.factSelector }
                                corpus={ this.props.corpus } />

                        </div>
                    
                    :

                        <div/>

                    )
                }

                {

                    (!this.state.showComments && !this.state.showDecks && !this.state.edit ? 
                    
                    
                        <div className='debugButtonBar'>
                            <div className='button' onClick={ () => this.setState({ showComments: true }) }>
                                Comment
                            </div>
                            <div className='button' onClick={ () => this.setState({ showDecks: true }) }>
                                What am I studying?
                            </div>
                            <div className='button' onClick={ () => this.setState({ edit: true }) }>
                                Edit
                            </div>
                        </div>

                    :
                    
                        <div/>
                    
                    )

                }
            </div>
        }
        else {
            return <div/>
        }
    }

}
