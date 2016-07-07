/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import { findSentencesForFact } from '../../shared/IndexSentencesByFact'

import InflectionFact from '../../shared/inflection/InflectionFact'
import { FORM_NAMES } from '../../shared/inflection/InflectionForms'

import Sentence from '../../shared/Sentence'

import InflectableWord from '../../shared/InflectableWord'
import InflectedWord from '../../shared/InflectedWord'
import UnstudiedWord from '../../shared/UnstudiedWord'

import UnknownFact from './UnknownFact'
import UnknownFactComponent from './UnknownFactComponent'
import Fact from '../../shared/fact/Fact'

import LeitnerKnowledge from '../../shared/study/LeitnerKnowledge'

import FrontendExposures from './FrontendExposures'
import { Exposure, Skill, Knowledge } from '../../shared/study/Exposure'

interface Props {
    sentence: Sentence,
    fact: InflectionFact,
    factKnowledge: LeitnerKnowledge,
    onAnswer: (exposures: Exposure[]) => void
}

interface State {
    unknownFacts?: UnknownFact[],
    knownFacts?: UnknownFact[],
    stage?: Stage 
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

    isStudiedForm(word) {
        let form = this.props.fact.form

        return word instanceof InflectedWord &&
            word.form == form &&
            word.word.inflection.pos == this.props.fact.inflection.pos &&
            word.word.inflection.getEnding(form) === this.props.fact.inflection.getEnding(form)
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

        console.log('Sending exposures: ' + exposures.map((exp) => exp.fact + ': ' + exp.knew).join(', '))

        this.props.onAnswer(exposures)
    }

    unknownWord(word: UnstudiedWord) {
        let facts: UnknownFact[] = []

        word.visitFacts((fact: Fact) => {
            if (fact instanceof InflectionFact && 
                fact.form == fact.inflection.defaultForm) {
                return
            }

            facts.push({
                fact: fact,
                word: word
            })
        })

        this.unknown(...facts)
    }

    unknown(...facts: UnknownFact[]) {
        let unknown = this.state.unknownFacts
        let known = this.state.knownFacts 

        facts.forEach((fact) => unknown = excludeFact(fact, unknown))
        facts.forEach((fact) => known = excludeFact(fact, known))

        this.setState({
            unknownFacts: unknown.concat(facts),
            knownFacts: known
        })
    }

    known(...facts: UnknownFact[]) {
        let unknown = this.state.unknownFacts
        let known = this.state.knownFacts 

        facts.forEach((fact) => unknown = excludeFact(fact, unknown))
        facts.forEach((fact) => known = excludeFact(fact, known))

        this.setState({
            unknownFacts: unknown,
            knownFacts: known.concat(facts)
        })
    }

    unknownFactsFromFact(fact: Fact, word: UnstudiedWord): UnknownFact[] {
        let facts: Fact[] = []

        this.props.fact.visitFacts((fact: Fact) => facts.push(fact))

        return facts.map((fact) => { 
            return {
                fact: this.props.fact,
                word: word
            }
        })
    }

    iWasWrong(studiedWord) {
        this.unknown(...this.unknownFactsFromFact(this.props.fact, studiedWord))

        this.setState({ stage: Stage.CONFIRM })
    }

    iWasRight(studiedWord) {
        this.next(...this.unknownFactsFromFact(this.props.fact, studiedWord))
    }

    render() {
        let studiedWord: UnstudiedWord

        let reveal = this.state.stage !== Stage.TEST

        return <div className='study'>
                <div className='sentenceId'>(#{ this.props.sentence.id})</div>

                <div className='sentence'>
                { 
                    this.props.sentence.words.map((word, index) => {
                        let explain = () => {
                            this.unknownWord(word)

                            if (word === studiedWord && this.state.stage == Stage.REVEAL) {
                                this.setState({ stage: Stage.CONFIRM })
                            }
                        }

                        if (word instanceof InflectedWord &&
                            this.isStudiedForm(word)) {
                            studiedWord = word

                            if (reveal) {
                                return <div key={index} className='word revealed' onClick={ explain } >{ word.jp }</div> 
                            }
                            else {
                                return <div key={index} className='word nominalized' onClick={ explain }>{ word.getDefaultInflection().jp }</div> 
                            }

                        }
                        else {

                            return <div key={index} className='word' onClick={ explain }>{ word.jp }</div>

                        }
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
                            <div className='button' onClick={ () => this.iWasRight(studiedWord) }>I was right</div>
                            <div className='button' onClick={ () => this.iWasWrong(studiedWord) }>I was wrong</div>
                        </div>

                    :

                        <div className='buttonBar'>
                            <div className='button' onClick={ () => this.reveal() }>Reveal</div>
                        </div>

                    )
                ) }

                <h3>I didn't know</h3>
                <ul className='unknown'>
                {
                    (this.state.unknownFacts).map((unknownFact) => 
                        <UnknownFactComponent 
                            key={ unknownFact.fact.getId() }
                            hiddenFact={ (reveal ? null : this.props.fact) }
                            fact={ unknownFact.fact } 
                            unknownFact={ unknownFact } 
                            factKnowledge={ this.props.factKnowledge } 
                            onKnew={ (fact: UnknownFact) => this.known(fact) }
                            known={ true }
                        />)
                }
                </ul>

                <h3>I knew</h3>
                <ul className='unknown'>
                {
                    (this.state.knownFacts).map((unknownFact) => 
                        <UnknownFactComponent 
                            key={ unknownFact.fact.getId() }
                            hiddenFact={ (reveal ? null : this.props.fact) }
                            fact={ unknownFact.fact } 
                            unknownFact={ unknownFact } 
                            factKnowledge={ this.props.factKnowledge } 
                            onKnew={ (fact: UnknownFact) => this.unknown(fact) }
                            known={ false }
                        />)
                }
                </ul>
            </div>
    }
}


function getWordMeaningFactId(word: UnstudiedWord) {
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