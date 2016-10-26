

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'
import OldestSentenceSelector from '../../shared/study/OldestSentenceSelector'
import LastSawSentenceKnowledge from '../../shared/study/LastSawSentenceKnowledge'
import chooseHighestScoreSentence from '../../shared/study/chooseHighestScoreSentence'
import { NewFactsSelector, createNewFactsSelector } from '../../shared/study/NewFactsSelector'
import FactScore from '../../shared/study/FactScore'

import SentenceComponent from '../sentence/SentenceComponent'
import SentenceHistoryComponent from '../metadata/SentenceHistoryComponent'
import TrivialKnowledgeInspectorComponent from './TrivialKnowledgeInspectorComponent'
import StudyPlanComponent from './StudyPlanComponent'

import { indexSentencesByFact, SentencesByFactIndex } from '../../shared/SentencesByFactIndex'

import InflectionFact from '../../shared/inflection/InflectionFact'
import Sentence from '../../shared/Sentence'

import { Exposure, Knowledge, Skill } from '../../shared/study/Exposure'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import AbstractAnyWord from '../../shared/AbstractAnyWord'
import Word from '../../shared/Word'

import StudyComponent from './StudyComponent'
import TrivialKnowledge from '../../shared/study/TrivialKnowledge'
import KnowledgeSentenceSelector from '../../shared/study/KnowledgeSentenceSelector'
import sentencesForFacts from '../../shared/study/sentencesForFacts'
import topScores from '../../shared/study/topScores'
import { StudiedFacts } from '../../shared/study/StudyPlan'

import StudentProfile from '../../shared/study/StudentProfile'
import Phrase from '../../shared/phrase/Phrase'
import PhraseMatch from '../../shared/phrase/PhraseMatch'
import PhraseCase from '../../shared/phrase/PhraseCase'
import CaseStudyMatch from '../../shared/phrase/CaseStudyMatch'
import { WordMatched } from '../../shared/phrase/Match'
import { CaseStudy } from '../../shared/phrase/PhrasePattern'
import { GrammaticalCase } from '../../shared/inflection/InflectionForms'

import ExplainFactComponent from '../guide/fact/FactComponent'

import FrontendExposures from './FrontendExposures'
import { fetchStudyPlan } from './FrontendStudentProfile'
import ForgettingStats from './ForgettingStats'
import StudyFact from '../study/StudyFact'

interface Props {
    corpus: Corpus,
    xrArgs: { [arg: string] : string }
}

interface State {
    profile?: StudentProfile
    sentence?: Sentence
    facts?: Fact[]
    showComments?: boolean
    showTrivial?: boolean
    showPlan?: boolean
    edit?: boolean
    done?: boolean
    explainFact?: Fact
    explainContext?: InflectedWord
}

let React = { createElement: createElement }

export default class StudyContainerComponent extends Component<Props, State> {
    exposures: FrontendExposures
    knowledge: NaiveKnowledge
    sentenceKnowledge: LastSawSentenceKnowledge
    trivialKnowledge: TrivialKnowledge
    sentencesByFactIndex: SentencesByFactIndex 
    factSelector: FixedIntervalFactSelector
    newFactsSelector: NewFactsSelector

    forgettingStats: ForgettingStats

    constructor(props) {
        super(props)

        this.state = {}

        this.sentencesByFactIndex = indexSentencesByFact(props.corpus.sentences, props.corpus.facts, 0)
        this.factSelector = new FixedIntervalFactSelector(this.props.corpus.facts)
        this.knowledge = new NaiveKnowledge()
        this.trivialKnowledge = new TrivialKnowledge()
        this.exposures = new FrontendExposures(this.props.xrArgs, this.props.corpus.lang)
        this.sentenceKnowledge = new LastSawSentenceKnowledge()
        this.forgettingStats = new ForgettingStats(this.props.corpus)
    }

    explain(fact: StudyFact) {
        let context: InflectedWord = null
        let word = fact.words[0] ? fact.words[0].word : null

        if (word instanceof InflectedWord) {
            context = word
        }

        this.setState({ explainFact: fact.fact, explainContext: context })
    }

    chooseSentence() {
        let factScores = this.factSelector.chooseFact(new Date(), this.state.profile.studyPlan.getFacts().repeatedFacts)

console.log('new facts', this.newFactsSelector(true).map(f => f.fact.getId() + ' ' + f.score))
console.log('repeat facts', factScores.map(f => f.fact.getId() + ' ' + f.score))

        factScores = factScores.concat(this.newFactsSelector(true))

        if (!factScores.length) {
            this.setState({ sentence: null, done: true })
            return
        }

        factScores = topScores(factScores, 20)

        let sentenceScores = sentencesForFacts(factScores, this.sentencesByFactIndex)

        sentenceScores = new OldestSentenceSelector(this.sentenceKnowledge, this.props.corpus.facts)
            .scoreSentences(sentenceScores)

        sentenceScores = topScores(sentenceScores, 100)

        sentenceScores = new KnowledgeSentenceSelector(this.knowledge).scoreSentences(sentenceScores)


        var dev = document.location.hostname == 'localhost';

/*

        if (dev)
        this.setState({
            explainFact: this.props.corpus.facts.get('рядом')
        })

*/

/*
        if (dev)
        {
            let sentence = this.props.corpus.sentences.get(7730)

            this.knowledge.getKnowledge = (fact: Fact) => {
                return Knowledge.KNEW
            }

            this.knowledge.getKnowledgeOfId = (factId: string) => {
                return Knowledge.KNEW
            }

            this.setState({
                sentence: sentence,
                facts: this.expandFact(this.props.corpus.facts.get('себя'), sentence)
            })

            return
        }
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

            if (phrase && !phrase.match({ sentence: score.sentence, words: score.sentence.words, facts: this.props.corpus.facts })) {
                console.log(score.sentence + ' did not match phrase ' + phrase)
                return false
            }
            else {
                return true
            }
        })

        let sentenceScore = chooseHighestScoreSentence(sentenceScores)

        if (!sentenceScore) {
            console.error('No sentence could be picked for ' + factScores.map(f => f.fact.getId()))

            this.setState({ sentence: null, done: true })
            return
        }

        let sentence = sentenceScore.sentence
        let fact = sentenceScore.fact

        console.log(sentenceScore)

        this.setState({ sentence: sentence, facts: this.expandFact(fact, sentence) })
    }

    oughtToKnow(fact: Fact) {
        return this.knowledge.getKnowledge(fact) == Knowledge.KNEW ||
            this.factSelector.isStudied(fact, new Date())
    }
    
    expandFact(fact: Fact, sentence: Sentence) {
        let additionalFact: Fact

        let studiedFacts = [ fact ]

        if (fact instanceof Phrase) {
            fact.getCaseFacts().forEach((caseFact) => {
                if (this.oughtToKnow(caseFact)) {
                    additionalFact = caseFact
                }
            })
        }
        else if (fact instanceof PhraseCase) {
            if (this.oughtToKnow(fact.phrase)) {
                additionalFact = fact.phrase
            }
        }

        if (additionalFact) {
            console.log('Additional fact ' + additionalFact.getId())

            studiedFacts.push(additionalFact)
        }

        // if we study a word or an ending but we are in fact part of a phrase, 
        // we can just as well take the whole phrase.
        if (!(fact instanceof PhraseCase) && !(fact instanceof Phrase)) {
            let wordRequiresFact = (word: Word, fact: Fact) => {
                let result = false

                word.visitFacts((visitedFact) => {
                    if (visitedFact.getId() == fact.getId()) {
                        result = true
                    }
                })

                return result
            }

            let findWordMatched = (words: WordMatched[], fact: Fact) => {
                return words.find(word => wordRequiresFact(word.word, fact))
            }

            let oughtToKnowAllFacts = (words: WordMatched[]) => {
                return !words.find(word => {
                    let oughtNotTo = false

                    word.word.visitFacts((visitedFact) => {
                        if (!this.oughtToKnow(visitedFact)) {
console.log('Did not ought to know ' + visitedFact.getId())                            
                            oughtNotTo = true
                        }
                    })

                    return oughtNotTo
                }) 
            }

            let longestKnownPhrase: Fact
            let longestKnownPhraseLength: number = -1
            let mustUseFact: Fact

            let candidateFact = (fact: Fact, words: WordMatched[]) => {
                console.log('Candidate phrase: ' + fact.getId() + ' - ' + words.map(w => w.word.jp).join(' '))
                
                if (words.length > longestKnownPhraseLength) {
                    longestKnownPhrase = fact
                    longestKnownPhraseLength = words.length
                }
            }

            sentence.phrases.forEach(phrase => {
                let match = phrase.match({ 
                    sentence: sentence, 
                    words: sentence.words, 
                    facts: this.props.corpus.facts, 
                    study: CaseStudy.STUDY_BOTH })

                if (match) {
                    let wordMatched = findWordMatched(match.words, fact)

                    if (wordMatched && oughtToKnowAllFacts(match.words)) {
                        candidateFact(phrase, match.words)
                    }
                    else {
                        if (wordMatched) { // ...but didn't know the words
                            // we still need to use the phrase since the phrase 
                            // might have an entirely different meaning from the word.

                            console.log('Didnt know all facts in ' + phrase.getId() + ' - ' + 
                                match.words.map(w => w.word.jp).join(' ') + ' but must use it anyway since ' +
                                wordMatched.word.toText() + ' might mean something else in it')

                            mustUseFact = phrase
                        }

                        phrase.getCaseFacts().forEach((caseFact) => {
                            let words = match.words.filter(wm => wm.wordMatch.isCaseStudy() &&
                                ((wm.wordMatch as any) as CaseStudyMatch).getCaseStudied() == caseFact.grammaticalCase)

                            if (findWordMatched(words, fact)) {
                                if (oughtToKnowAllFacts(words)) {
                                    candidateFact(caseFact, words)
                                }
                            }
                        })
                    }
                }
            })

            let switchTo = longestKnownPhrase || mustUseFact

            if (switchTo) {
                console.log('Switching to fact ' + switchTo.getId())

                studiedFacts = studiedFacts.filter(f => f.getId() != fact.getId())

                studiedFacts.push(switchTo)
            }
        }

        return studiedFacts
    }

    studyPlanLoaded() {
        this.chooseSentence()
    }

    componentWillMount() {
        Promise.all([
            fetchStudyPlan(this.props.corpus, this.props.xrArgs),
            this.exposures.getExposures(-1)
        ]).then(result => {
            let profile = { studyPlan: result[0], knowledge: this.knowledge }
            this.newFactsSelector = createNewFactsSelector(profile, 
                this.knowledge, this.factSelector, 0.1, 50, this.props.corpus)

            this.processExposures(result[1])

            this.setState({
                profile: profile
            })

            if (!profile.studyPlan.isEmpty()) {
                this.studyPlanLoaded()
            }
            else {
                this.setState({ showPlan: true })
            }
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
        let profile = this.state.profile

        let explain = null

        if (this.state.explainFact) {
            explain = <ExplainFactComponent 
                corpus={ this.props.corpus }
                fact={ this.state.explainFact }
                context={ this.state.explainContext }
                knowledge={ this.knowledge }
                onClose={ () => this.setState({ explainFact: null }) }
                onSelectFact={ (fact, context?) => 
                    this.setState({ explainFact: fact, explainContext: context }) }
            />
        }

        if (this.state.showPlan) {
            return <div>
                <StudyPlanComponent
                    profile={ profile }
                    corpus={ this.props.corpus }
                    factSelector={ this.factSelector }
                    newFactSelector={ this.newFactsSelector }
                    onSubmit={ 
                        facts => {
                            profile.studyPlan.setFacts(facts, this.factSelector)
                            this.studyPlanLoaded()
                            this.setState({ showPlan: false })
                        }}
                    onMarkAsKnown={
                        (fact: Fact) => {
                            return this.exposures.registerExposures([
                                {
                                    fact: fact.getId(),
                                    time: new Date(),
                                    skill: Skill.SAY_SO,
                                    knew: Knowledge.KNEW,
                                    user: -1,
                                    sentence: null
                                }
                            ])
                        }
                    }
                    onExplain={ (fact) => this.explain(fact) } />
                {
                    explain
                }
            </div>
        }
        else if (this.state.sentence) {
            return <div className='studyOuter'>
                <div className='study'>
                    <StudyComponent 
                        sentence={ this.state.sentence }
                        facts={ this.state.facts }
                        factSelector={ this.factSelector }
                        corpus={ this.props.corpus }
                        profile={ this.state.profile }
                        trivialKnowledge={ this.trivialKnowledge }
                        onAnswer={ (exposures) => this.onAnswer(exposures)} 
                        openPlan={ () => this.setState({ showPlan: true }) } 
                        onExplain={ (fact) => this.explain(fact) } />            
                </div>

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
                    (this.state.showTrivial ?

                    <div>
                        <div className='debugButtonBar'>
                            <div className='button' onClick={ () => this.setState({ showTrivial: false }) }>Close</div>
                        </div>

                        <TrivialKnowledgeInspectorComponent 
                            knowledge={ this.trivialKnowledge }
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

                    (!this.state.showComments && !this.state.edit && !this.state.showTrivial ? 

                        <div className='debugButtonBar'>
                            <div className='button' onClick={ () => this.setState({ showComments: true }) }>
                                Comment
                            </div>
                            <div className='button' onClick={ () => this.setState({ showTrivial: true }) }>
                                What do I know?
                            </div>
                            <div className='button' onClick={ () => this.setState({ edit: true }) }>
                                Edit
                            </div>
                        </div>

                    :

                        <div/>

                    )

                }

                {
                    explain
                }
            </div>
        }
        else if (this.state.done) {
            return <div>
                <h2>Study session done.</h2>

                <div className='button' onClick={ () => {
                    this.state.profile.studyPlan.clear()

                    this.setState({ profile: profile, showPlan: true })
                }}>Start new session</div>     
            </div>
        }
        else {
            return <div/>
        }
    }

}
