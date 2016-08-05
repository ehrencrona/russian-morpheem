/// <reference path="../../../typings/react/react.d.ts" />

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

import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import LeitnerKnowledge from '../../shared/study/LeitnerKnowledge'
import { Exposure, Skill, Knowledge } from '../../shared/study/Exposure'
import TrivialKnowledge from '../../shared/study/TrivialKnowledge'
import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'
import { InflectionForm, CASES, FORMS, Tense, Number, Gender } from '../../shared/inflection/InflectionForms'

import StudyFact from './StudyFact'
import StudyWord from './StudyWord'
import StudyFactComponent from './StudyFactComponent'
import FrontendExposures from './FrontendExposures'

import toStudyWords from './toStudyWords'
import isGiveaway from './isGiveaway'

interface Props {
    sentence: Sentence,
    corpus: Corpus,
    fact: Fact,
    knowledge: NaiveKnowledge,
    trivialKnowledge: TrivialKnowledge,
    factSelector: FixedIntervalFactSelector
    onAnswer: (exposures: Exposure[]) => void
}

interface WordGroup {
    words: StudyWord[],
    startIndex: number
}

interface State {
    words?: StudyWord[],
    groupedWords?: WordGroup[],
    unknownFacts?: StudyFact[],
    knownFacts?: StudyFact[],
    stage?: Stage,
    additionalStudyFact?: Fact
}

let React = { createElement: createElement }

enum Stage {
    TEST, REVEAL, CONFIRM
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

console.log('Sentence: ' + sentence.toString())

        let additionalFact: Fact
        let fact = props.fact

console.log('Fact ' + fact.getId())

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

        let studiedFacts = [ props.fact ]

        if (additionalFact) {
            console.log('Additional fact ' + additionalFact.getId())

            studiedFacts.push(additionalFact)
        }

        let words = toStudyWords(sentence, studiedFacts, props.corpus)

        let corpus = props.corpus

        let groupedWords: WordGroup[] = []

        words.forEach((word, index) => {
            if (!groupedWords.length || isWordWithSpaceBefore(word)) {
                groupedWords.push({ words: [word], startIndex: index })
            }
            else {
                groupedWords[groupedWords.length-1].words.push(word)
            }
        })

        return {
            words: words,
            groupedWords: groupedWords,
            unknownFacts: [], 
            knownFacts: [],
            stage: Stage.TEST,
            additionalStudyFact: additionalFact
        }
    }

    isStudiedFact(fact: Fact) {
        let additionalStudyFact = this.state.additionalStudyFact

        if (additionalStudyFact && additionalStudyFact.getId() == fact.getId()) {
            return true
        }

        return this.props.fact.getId() == fact.getId()
    }

    isWordHidden(word: StudyWord): boolean {
        let fact = this.props.fact

        return !!word.facts.find((f) => this.isStudiedFact(f.fact))
    }

    reveal() {
        this.setState({ 
            stage: Stage.REVEAL,
            unknownFacts: this.state.unknownFacts
        })
    }

    next(...addKnownFacts: StudyFact[]) {
        let factToExposure = (fact: StudyFact, knew: Knowledge) => {
            return {
                fact: fact.fact.getId(),
                time: new Date(),
                skill: (fact.fact.getId() == this.props.fact.getId() ? Skill.PRODUCTION : Skill.RECOGNITION),
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

    explainWords(words: StudyWord[], hiddenFacts: StudyFact[], somethingIsUnknown?: boolean) {
        
        let known: StudyFact[] = [], 
            unknown: StudyFact[] = []

        let addFact = (fact: StudyFact) =>
            (this.props.trivialKnowledge.isKnown(fact.fact) && fact.fact.getId() != this.props.fact.getId() ?
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

        this.addFacts(known, unknown)
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

        this.setState({ stage: Stage.CONFIRM })
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

            let studyFact = this.props.fact
            let additionalId

            hiddenFacts = hiddenFacts.filter((fact) => 
                this.isStudiedFact(fact.fact) ||
                this.oughtToKnow(fact.fact))
        }

        return <div className='study'>
                <div className='sentenceId'>
                    (<a href={ 'http://grammar.ru.morpheem.com/#' + sentence.id } target='backend'>
                        #{ sentence.id})
                    </a>)
                </div>

                <div className='explanation'>
                    {
                        (this.state.stage == Stage.TEST ?

                            (this.props.fact instanceof InflectionFact ?
                                'What form should the highlighed word be in?'
                                :
                                (this.props.fact instanceof Phrase ?
                                    'What words complete the expression?'
                                    :
                                    'What Russian word is missing?'
                                    )
                                )

                            :

                            (this.state.stage == Stage.REVEAL ?
                                'Did you get it right?'
                                :
                                'Check the facts you didn\'t know below')
                        )
                    }
                </div>

                <div className='sentence'>
                { 
                    this.state.groupedWords.map((group, index) => {
                        return <div className='group' key={ index }>
                        {
                            group.words.map((word: StudyWord, index) => {
                                let explain = () => {
                                    this.explainWords([word], hiddenFacts)

                                    if (this.isWordHidden(word) && this.state.stage == Stage.REVEAL) {
                                        this.setState({ stage: Stage.CONFIRM })
                                    }
                                }

                                let className = ''
                                let text = word.jp

                                if (capitalize && text) {
                                    text = text[0].toUpperCase() + text.substr(1)
                                }

                                let formHint

                                if (this.isWordHidden(word)) {
                                    if (!reveal) {
                                        text = word.getHint()
                                        formHint = word.getFormHint()
                                    }

                                    if (reveal) {
                                        className += ' revealed' 
                                    }
                                    else {
                                        className += ' nominalized'
                                    }
                                }

                                capitalize = word.jp && Words.SENTENCE_ENDINGS.indexOf(word.jp) >= 0

                                return <div key={ index } className={ 'word ' + className } onClick={ explain }>
                                        <div>{ text }</div>
                                    { (formHint ?
                                        <div className='form'>{ formHint }</div>
                                        :
                                        <div></div>                                
                                    ) }
                                </div>
                            })
                        }
                        </div>            
                    })
                }
                </div>

                { (this.state.stage == Stage.CONFIRM ?

                    <div className='buttonBar'>
                        <div className='button' onClick={ () => this.next() }>Continue</div>
                    </div>

                    :

                    (this.state.stage == Stage.REVEAL ?

                        <div className='buttonBar'>
                            <div className='button' onClick={ () => this.iWasRight() }>I was right</div>
                            <div className='button' onClick={ () => this.iWasWrong(hiddenFacts) }>I was wrong</div>
                        </div>

                    :

                        <div className='buttonBar'>
                            <div className='button' onClick={ () => this.reveal() }>Reveal</div>
                        </div>

                    )
                ) }

                { (this.state.knownFacts.length || this.state.unknownFacts.length ? 

                    <div>
                        <h3>I didn't know</h3>
                        <ul className='unknown'>
                        {
                            (this.state.unknownFacts).map((studyFact) => 
                                <StudyFactComponent 
                                    key={ studyFact.fact.getId() }
                                    hiddenFacts={ (reveal ? [] : hiddenFacts) }
                                    fact={ studyFact.fact } 
                                    studyFact={ studyFact } 
                                    sentence={ this.props.sentence } 
                                    corpus={ this.props.corpus }
                                    knowledge={ this.props.knowledge } 
                                    onKnew={ (fact: StudyFact) => this.addFacts([ fact ], []) }
                                    known={ true }
                                />)
                        }
                        </ul>
                    </div>
                    
                 : 

                    <div/>
                )}

                { (this.state.knownFacts.length ? 

                    <div>
                        <h3>I knew</h3>
                        <ul className='unknown'>
                        {
                            (this.state.knownFacts).map((studyFact) => 
                                <StudyFactComponent 
                                    key={ studyFact.fact.getId() }
                                    hiddenFacts={ (reveal ? [] : hiddenFacts) }
                                    fact={ studyFact.fact } 
                                    studyFact={ studyFact }
                                    sentence={ this.props.sentence } 
                                    corpus={ this.props.corpus }
                                    knowledge={ this.props.knowledge } 
                                    onKnew={ (fact: StudyFact) => this.addFacts([], [ fact ]) }
                                    known={ false }
                                />)
                        }
                        </ul>
                    </div>

                    :

                    <div/>
                )}

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

function isWordWithSpaceBefore(word: StudyWord) {
    return !(word.jp.length == 1 && Words.PUNCTUATION_NOT_PRECEDED_BY_SPACE.indexOf(word.jp) >= 0)
}