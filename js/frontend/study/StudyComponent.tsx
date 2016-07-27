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
import { CaseStudy } from '../../shared/phrase/PhrasePattern'

import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import LeitnerKnowledge from '../../shared/study/LeitnerKnowledge'
import { Exposure, Skill, Knowledge } from '../../shared/study/Exposure'
import TrivialKnowledge from '../../shared/study/TrivialKnowledge'

import { InflectionForm, CASES, FORMS, Tense, Number, Gender } from '../../shared/inflection/InflectionForms'

import UnknownFact from './UnknownFact'
import StudyWord from './StudyWord'
import UnknownFactComponent from './UnknownFactComponent'
import FrontendExposures from './FrontendExposures'

import toStudyWords from './toStudyWords'

interface Props {
    sentence: Sentence,
    corpus: Corpus,
    fact: Fact,
    knowledge: NaiveKnowledge,
    trivialKnowledge: TrivialKnowledge,
    onAnswer: (exposures: Exposure[]) => void
}

interface State {
    unknownFacts?: UnknownFact[],
    knownFacts?: UnknownFact[],
    stage?: Stage,
}

let React = { createElement: createElement }

enum Stage {
    TEST, REVEAL, CONFIRM
}

export default class StudyComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            unknownFacts: [],
            knownFacts: [],
            stage: Stage.TEST
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ 
            unknownFacts: [], 
            knownFacts: [],
            stage: Stage.TEST
        })
    }

    isStudiedForm(word: StudyWord) {
        let fact = this.props.fact

        let result = false

        return word.facts.find((f) => f.fact.getId() == fact.getId()) 
    }

    reveal() {
        this.setState({ 
            stage: Stage.REVEAL,
            unknownFacts: excludeFact({ fact: this.props.fact, word: null }, this.state.unknownFacts) 
        })
    }

    next(...addKnownFacts: UnknownFact[]) {
        let factToExposure = (fact: UnknownFact, knew: Knowledge) => {
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

        unknown.forEach((unknownFact) => 
            exposures.push(factToExposure(unknownFact, Knowledge.DIDNT_KNOW)))
        known.forEach((knownFact) => 
            exposures.push(factToExposure(knownFact, Knowledge.KNEW)))

        this.props.sentence.visitFacts((fact) => {
            if (exposures.find((exposure) => exposure.fact == fact.getId())) {
                return
            }

            exposures.push(factToExposure({
                fact: fact,
                word: null
            }, Knowledge.KNEW))
        })

        console.log('Sending exposures: ' + 
            exposures.map((exp) => exp.fact + ': ' + 
                (exp.knew == Knowledge.KNEW ? 'knew' : 'didnt know') + ' (skill ' + exp.skill + ')').join(', '))

        this.props.onAnswer(exposures)
    }

    explainWord(word: StudyWord, reveal: boolean, somethingIsUnknown?: boolean) {
        let known: UnknownFact[] = [], 
            unknown: UnknownFact[] = []

        let addFact = (fact: UnknownFact) =>
            (this.props.trivialKnowledge.isKnown(fact.fact) && fact.fact.getId() != this.props.fact.getId() ?
                known :
                unknown).push(fact)

        let facts

        if (!reveal && this.isStudiedForm(word)) {
            facts = word.getHintFacts()
        }
        else {
            facts = word.facts
        }

        facts.forEach(addFact)

        if (!unknown.length && somethingIsUnknown) {
            unknown = known
            known = []
        }

        this.addFacts(known, unknown)
    }

    addFacts(addKnown: UnknownFact[], addUnknown: UnknownFact[]) {
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

    iWasWrong(words: StudyWord[]) {
        words.forEach((word: StudyWord) => {
            if (this.isStudiedForm(word)) {
                this.explainWord(word, true, true)
            }
        })

        this.setState({ stage: Stage.CONFIRM })
    }

    iWasRight(words: StudyWord[]) {
        let facts: UnknownFact[] = []

        words.forEach((word: StudyWord) => {
            if (this.isStudiedForm(word)) {
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

        let words = toStudyWords(sentence, this.props.fact, this.props.corpus)

console.log('Study words', words)

        let corpus = this.props.corpus

        interface WordGroup {
            words: StudyWord[],
            startIndex: number
        }

        let groupedWords: WordGroup[] = []

        words.forEach((word, index) => {
            if (!groupedWords.length || isWordWithSpaceBefore(word)) {
                groupedWords.push({ words: [word], startIndex: index })
            }
            else {
                groupedWords[groupedWords.length-1].words.push(word)
            }
        })

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
                    groupedWords.map((group, index) => {
                        return <div className='group' key={ index }>
                        {
                            group.words.map((word: StudyWord, index) => {
                                let explain = () => {
                                    this.explainWord(word, reveal)

                                    if (this.isStudiedForm(word) && this.state.stage == Stage.REVEAL) {
                                        this.setState({ stage: Stage.CONFIRM })
                                    }
                                }

                                let className = ''
                                let text = word.jp

                                if (capitalize && text) {
                                    text = text[0].toUpperCase() + text.substr(1)
                                }

                                let formHint

                                if (this.isStudiedForm(word)) {
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
                            <div className='button' onClick={ () => this.iWasRight(words) }>I was right</div>
                            <div className='button' onClick={ () => this.iWasWrong(words) }>I was wrong</div>
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
                            (this.state.unknownFacts).map((unknownFact) => 
                                <UnknownFactComponent 
                                    key={ unknownFact.fact.getId() }
                                    hiddenFact={ (reveal ? null : this.props.fact) }
                                    fact={ unknownFact.fact } 
                                    unknownFact={ unknownFact } 
                                    sentence={ this.props.sentence } 
                                    corpus={ this.props.corpus }
                                    knowledge={ this.props.knowledge } 
                                    onKnew={ (fact: UnknownFact) => this.addFacts([ fact ], []) }
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
                            (this.state.knownFacts).map((unknownFact) => 
                                <UnknownFactComponent 
                                    key={ unknownFact.fact.getId() }
                                    hiddenFact={ (reveal ? null : this.props.fact) }
                                    fact={ unknownFact.fact } 
                                    unknownFact={ unknownFact }
                                    sentence={ this.props.sentence } 
                                    corpus={ this.props.corpus }
                                    knowledge={ this.props.knowledge } 
                                    onKnew={ (fact: UnknownFact) => this.addFacts([], [ fact ]) }
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

function excludeFact(exclude: UnknownFact, array: UnknownFact[]) {
    return array.filter((f) => f.fact.getId() !== exclude.fact.getId())
}

function isWordWithSpaceBefore(word: StudyWord) {
    return !(word.jp.length == 1 && Words.PUNCTUATION_NOT_PRECEDED_BY_SPACE.indexOf(word.jp) >= 0)
}