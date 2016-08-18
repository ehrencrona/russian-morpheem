

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import { findSentencesForFact } from '../../shared/SentencesByFactIndex'

import InflectionFact from '../../shared/inflection/InflectionFact'

import Sentence from '../../shared/Sentence'

import InflectableWord from '../../shared/InflectableWord'
import InflectedWord from '../../shared/InflectedWord'
import Word from '../../shared/Word'

import Fact from '../../shared/fact/Fact'
import Words from '../../shared/Words'
import Phrase from '../../shared/phrase/Phrase'
import PhraseCase from '../../shared/phrase/PhraseCase'
import { CaseStudy } from '../../shared/phrase/PhrasePattern'
import CaseStudyMatch from '../../shared/phrase/CaseStudyMatch'

import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import LeitnerKnowledge from '../../shared/study/LeitnerKnowledge'
import { Exposure, Skill, Knowledge } from '../../shared/study/Exposure'
import TrivialKnowledge from '../../shared/study/TrivialKnowledge'
import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'
import { InflectionForm, CASES, FORMS, Tense, Number, Gender } from '../../shared/inflection/InflectionForms'
import htmlEscape from '../../shared/util/htmlEscape'

import DidYouKnowComponent from './DidYouKnowComponent'
import StudyFact from './StudyFact'
import StudyWord from './StudyWord'
import FrontendExposures from './FrontendExposures'
import SentenceComponent from './SentenceComponent'

import toStudyWords from './toStudyWords'
import isGiveaway from './isGiveaway'

interface Props {
    sentence: Sentence,
    corpus: Corpus,
    facts: Fact[],
    knowledge: NaiveKnowledge,
    trivialKnowledge: TrivialKnowledge,
    factSelector: FixedIntervalFactSelector
    onAnswer: (exposures: Exposure[]) => void
}

interface State {
    words?: StudyWord[],
    didYouKnow?: StudyFact[],
    unknownFacts?: StudyFact[],
    knownFacts?: StudyFact[],
    stage?: Stage,
    highlightFact?: StudyFact
}

let React = { createElement: createElement }

enum Stage {
    TEST, REVEAL, DID_YOU_KNOW, CONFIRM
}

export default class StudyComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = this.getStateForProps(props)
    }

    componentWillReceiveProps(nextProps) {
        this.setState(this.getStateForProps(nextProps))
    }

    oughtToKnow(fact: Fact) {
        return this.props.knowledge.getKnowledge(fact) == Knowledge.KNEW ||
            this.props.factSelector.isStudied(fact, new Date())
    }

    getStateForProps(props: Props): State {
        let sentence = props.sentence

        return {
            unknownFacts: [], 
            knownFacts: [],
            stage: Stage.TEST,
            words: toStudyWords(sentence, props.facts, props.corpus),
            highlightFact: null
        }
    }

    isStudiedFact(fact: Fact) {
        return !!this.props.facts.find(f => f.getId() == fact.getId())
    }

    isWordHidden(word: StudyWord): boolean {
        return !!word.facts.find((f) => this.isStudiedFact(f.fact))
    }

    reveal() {
        this.setState({ 
            stage: Stage.REVEAL,
            unknownFacts: this.state.unknownFacts
        })
    }

    next(...addKnownFacts: StudyFact[]) {
        let productionFacts: { [id: string]: boolean } = {}

        this.state.words.forEach(w => {
            if (this.isWordHidden(w)) {
                w.facts.forEach(f => productionFacts[f.fact.getId()] = true)
            }
        })

        let factToExposure = (fact: StudyFact, knew: Knowledge) => {
            return {
                fact: fact.fact.getId(),
                time: new Date(),
                skill: productionFacts[fact.fact.getId()] ? Skill.PRODUCTION : Skill.RECOGNITION,
                knew: knew,
                user: -1,
                sentence: this.props.sentence.id
            }
        }

        let unknown = this.state.unknownFacts
        let known = this.state.knownFacts 

        addKnownFacts.forEach((addKnownFact) => {
            unknown = excludeFact(addKnownFact, unknown)
            known = excludeFact(addKnownFact, known).concat(addKnownFact)
        })

        let unknownWordIds = new Set<String>()

        let exposures: Exposure[] = []

        unknown.forEach((studyFact) => 
            exposures.push(factToExposure(studyFact, Knowledge.DIDNT_KNOW)))
        known.forEach((knownFact) => 
            exposures.push(factToExposure(knownFact, Knowledge.KNEW)))

        this.props.sentence.visitFacts((fact) => {
            if (exposures.find((exposure) => exposure.fact == fact.getId())) {
                return
            }

            exposures.push(factToExposure({
                fact: fact,
                words: []
            }, Knowledge.KNEW))
        })

        console.log('Sending exposures: ' + 
            exposures.map((exp) => exp.fact + ': ' + 
                (exp.knew == Knowledge.KNEW ? 'knew' : 'didnt know') + ' (skill ' + exp.skill + ')').join(', '))

        this.props.onAnswer(exposures)
    }

    sortFactsToExplain(facts: StudyFact[]) {
        function prio(sf: StudyFact) {
            let fact: Fact = sf.fact

            if (fact instanceof Phrase) {
                return 1
            }
            else if (fact instanceof Word || fact instanceof InflectableWord) {
                return 2
            }
            else if (fact instanceof PhraseCase) {
                return 3
            }
            else if (fact instanceof InflectionFact) {
                return 4
            }
            else {
                return 5
            }
        }

        facts.sort((f1, f2) => {
            return prio(f1) - prio(f2)
        })
    }

    explainWords(words: StudyWord[], hiddenFacts: StudyFact[], somethingIsUnknown?: boolean) {
        let known: StudyFact[] = [], 
            unknown: StudyFact[] = []

        let addFact = (fact: StudyFact) =>
            (this.props.trivialKnowledge.isKnown(fact.fact) && 
                !this.props.facts.find(f => fact.fact.getId() == f.getId()) ?
                known :
                unknown).push(fact)

        let facts = []

        words.forEach((word) => {
            facts = facts.concat(word.facts.filter((f) => !isGiveaway(f, hiddenFacts)))
        })

        facts.forEach(addFact)

        if (!unknown.length && somethingIsUnknown) {
            unknown = known
            known = []
        }

        this.state.knownFacts.concat(this.state.unknownFacts).forEach(fact => {
            unknown = excludeFact(fact, unknown)
            known = excludeFact(fact, known)
        })

        if (unknown.length) {
            this.sortFactsToExplain(unknown)

            this.setState({
                didYouKnow: unknown,
                knownFacts: this.state.knownFacts.concat(known),
                stage: Stage.DID_YOU_KNOW,
                highlightFact: unknown[0]
            })
        }
    }

    addFacts(addKnown: StudyFact[], addUnknown: StudyFact[]) {
        let unknown = this.state.unknownFacts
        let known = this.state.knownFacts 

        addKnown.concat(addUnknown).forEach((fact) => {
            unknown = excludeFact(fact, unknown)
            known = excludeFact(fact, known)
        })

        this.setState({
            unknownFacts: unknown.concat(addUnknown),
            knownFacts: known.concat(addKnown)
        })
    }

    iWasWrong(hiddenFacts: StudyFact[]) {
        this.explainWords(this.state.words.filter((word) => 
            this.isWordHidden(word)), hiddenFacts, true)
    }

    iWasRight() {
        let facts: StudyFact[] = []

        this.state.words.forEach((word: StudyWord) => {
            if (this.isWordHidden(word)) {
                word.facts.forEach((fact) => 
                    facts.push(fact) 
                )
            }
        })

        this.next(...facts)
    }

    renderSentenceTranslation() {
        return <div className='lower'>
            <div className='translation'  dangerouslySetInnerHTML={ 
                { __html: htmlEscape(this.props.sentence.en()).replace(/ — /g, '<br/>— ') } }/>
        </div>
    }

    renderLower(hiddenFacts: StudyFact[]) {
        if (this.state.stage == Stage.DID_YOU_KNOW) {
            return <DidYouKnowComponent 
                facts={ this.state.didYouKnow} 
                factSelected={ (fact) => { this.setState({ highlightFact: fact }) } }
                done={ (known, unknown) => {
                    this.setState({
                        didYouKnow: null,
                        unknownFacts: this.state.unknownFacts.concat(unknown),
                        knownFacts: this.state.unknownFacts.concat(known),
                        stage: Stage.CONFIRM,
                        highlightFact: null
                    })
                } }
                corpus={ this.props.corpus }
                sentence={ this.props.sentence }
                knowledge={ this.props.knowledge }
                hiddenFacts={ hiddenFacts }    
            />
        }
        else if (this.state.stage == Stage.CONFIRM) {
            return <div>
                <div className='buttonBar'>
                    <div className='button' onClick={ () => this.next() }>Continue</div>
                </div>
                { this.renderSentenceTranslation() }
            </div>
        }
        else if (this.state.stage == Stage.REVEAL) {
            return <div>
                <div className='buttonBar'>
                    <div className='button left small' onClick={ () => this.iWasRight() }><span className='line'>I was</span> right</div>
                    <div className='button right small' onClick={ () => this.iWasWrong(hiddenFacts) }><span className='line'>I was</span> wrong</div>
                </div>
                { this.renderSentenceTranslation() }
            </div>
        }
        else {
            return <div>
                <div className='buttonBar'>
                    <div className='button' onClick={ () => this.reveal() }>Reveal</div>
                </div>
                <div className='lower'></div>
            </div>
        }
    }

    render() {
        let reveal = this.state.stage !== Stage.TEST
        let capitalize = true
        let sentence = this.props.sentence

console.log('Sentence: ' + sentence.toString())

        let words = this.state.words

        let hiddenFacts: StudyFact[] = []

        if (!reveal) {
            words.forEach((word) => {
                if (this.isWordHidden(word)) {
                    hiddenFacts = hiddenFacts.concat(word.facts)
                }
            })

            let additionalId

            hiddenFacts = hiddenFacts.filter((fact) => 
                this.isStudiedFact(fact.fact) ||
                this.oughtToKnow(fact.fact))
        }

        return <div className='content'>
            <div className={ 'upper' + (this.state.stage == Stage.DID_YOU_KNOW ? ' dimmed' : '') }>
                <div className='sentenceId'>
                    (<a href={ 'http://grammar.ru.morpheem.com/#' + sentence.id } target='backend'>
                        #{ sentence.id})
                    </a>)
                </div>

                <div className='explanation'>
                    {
                        (this.state.stage == Stage.TEST ?

                            (this.props.facts.find(f => f instanceof Phrase) ?
                                'What words complete the expression?'
                                :
                                'What Russian word is missing?'
                            )

                            :

                            (this.state.stage == Stage.REVEAL ?
                                'Did you get it right?'
                                :
                                'Check the facts you didn\'t know below')
                        )
                    }
                </div>

                <SentenceComponent
                    corpus={ this.props.corpus }
                    reveal={ reveal }
                    words={ this.state.words }
                    facts={ this.props.facts }
                    highlight={ this.state.highlightFact }
                    wordClicked={
                        (word: StudyWord) => {
                            this.explainWords([word], hiddenFacts)

                            if (this.isWordHidden(word) && this.state.stage == Stage.REVEAL) {
                                this.setState({ stage: Stage.CONFIRM })
                            }
                        }
                    }
                />

            </div>

            { this.renderLower(hiddenFacts) }
        </div>
    }
}


function getWordMeaningFactId(word: Word) {
    if (word instanceof InflectedWord) {
        return word.word.getId()
    }
    else {
        return word.getId()
    }
}

function excludeFact(exclude: StudyFact, array: StudyFact[]) {
    return array.filter((f) => f.fact.getId() !== exclude.fact.getId())
}
