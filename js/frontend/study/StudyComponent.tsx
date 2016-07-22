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

import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import LeitnerKnowledge from '../../shared/study/LeitnerKnowledge'
import { Exposure, Skill, Knowledge } from '../../shared/study/Exposure'
import TrivialKnowledge from '../../shared/study/TrivialKnowledge'

import { CASES, FORMS, Tense, Number, Gender } from '../../shared/inflection/InflectionForms'

import UnknownFact from './UnknownFact'
import UnknownFactComponent from './UnknownFactComponent'
import FrontendExposures from './FrontendExposures'

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

    isStudiedForm(word) {
        let fact = this.props.fact

        let result = false

        word.visitFacts((otherFact: Fact) => {
            if (fact.getId() == otherFact.getId()) {
                result = true
            }
        })

        return result
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

    explainWord(word: Word, phrase: Phrase, somethingIsUnknown?: boolean) {
        let known: UnknownFact[] = [], 
            unknown: UnknownFact[] = []

        let addFact = (fact: UnknownFact) =>
            (this.props.trivialKnowledge.isKnown(fact.fact) && fact.fact.getId() != this.props.fact.getId() ?
                known :
                unknown).push(fact)

        // if we are looking for a phrase it's ok to give the main component words as a hint and 
        // the description of the phrase, but nothing more (particularly not any cases or prepositions)
        if (phrase && phrase.getId() == this.props.fact.getId()) { 
            this.unknownFactsFromWord(word).
                filter((word) => {
                    let fact = word.fact
                    
                    if (fact instanceof InflectableWord) {
                        let pos = fact.inflection.pos
                        
                        return pos == 'v' || pos == 'adj' || pos == 'n'
                    }
                }).
                forEach(addFact)
        }
        else {
            this.unknownFactsFromWord(word).forEach(addFact)
        }


        if (phrase) {
            addFact({ fact: phrase, word: word })
        }

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

    unknownFactsFromWord(word: Word): UnknownFact[] {
        let facts: Fact[] = []

        word.visitFacts((fact: Fact) => facts.push(fact))

        facts = facts.filter((fact) =>
            !(fact instanceof InflectionFact) || 
            (fact.form != fact.inflection.defaultForm))

        return facts.map((fact) => { 
            return {
                fact: fact,
                word: word
            }
        })
    }

    iWasWrong(studiedWord, phrase: Phrase) {
        this.explainWord(studiedWord, phrase, true)

        this.setState({ stage: Stage.CONFIRM })
    }

    iWasRight(studiedWord, phrase: Phrase) {
        let facts = this.unknownFactsFromWord(studiedWord)

        if (phrase) {
            facts = facts.concat({ fact: phrase, word: studiedWord } )
        }

        this.next(...facts)
    }

    getFormHint() {
        let fact = this.props.fact

        if (fact instanceof InflectionFact || fact instanceof InflectedWord) {
            let form = FORMS[fact.form]

            if (!form) {
                console.warn(`Unknown form ${ fact.form }.`)
                return ''
            }

            let targetTense = form.tense
            let targetNumber = form.number
            let targetGender = form.gender

            let tenseHintNeeded = !!targetTense
            let numberHintNeeded = !!targetNumber

            // we will need to know the gender of nouns for this to work, we don't yet.
            let genderHintNeeded = false

            this.props.sentence.words.forEach((word) => {

                if (word instanceof InflectedWord && !this.isStudiedForm(word)) {
                    let form = FORMS[word.form]

                    if (!form) {
                        console.warn(`Unknown form ${word.form}.`)
                        return
                    }

                    if (tenseHintNeeded && form.tense && form.tense == targetTense) {
                        tenseHintNeeded = false
                    }

                    if (numberHintNeeded && form.number && form.number == targetNumber) {
                        numberHintNeeded = false
                    }

                    if (genderHintNeeded && form.gender && form.gender == targetGender) {
                        genderHintNeeded = false
                    }
                }

            })

            let result = ''

            if (tenseHintNeeded) {
                result += (targetTense == Tense.PAST ? 'past' : 'present') 
            }

            if (numberHintNeeded) {
                if (result) {
                    result += ', '
                }

                result += (targetNumber == Number.PLURAL ? 'plural' : 'singular') 
            }

            if (genderHintNeeded) {
                if (result) {
                    result += ', '
                }

                result += (targetGender == Gender.M ? 'masculine' : (targetGender == Gender.N ? 'neuter' : 'feminine')) 
            }

            return result         
        }
    }

    render() {
        let studiedWord: Word
        let studiedIndex: number

        let reveal = this.state.stage !== Stage.TEST
        let capitalize = true
        let sentence = this.props.sentence

        let words = sentence.words.slice(0)
        let corpus = this.props.corpus

        if (Words.PUNCTUATION.indexOf(words[words.length-1].jp) < 0) {
            words.push(this.props.corpus.words.get('.'))
        }

        interface WordGroup {
            words: Word[],
            startIndex: number
        }

        let groupedWords: WordGroup[] = []

        words.forEach((word, index) => {
            if (isWordWithSpaceBefore(word)) {
                groupedWords.push({ words: [word], startIndex: index })
            }
            else {
                groupedWords[groupedWords.length-1].words.push(word)
            }
        })

        let phraseForWord = (wordIndex) => 
            sentence.phrases.find((phrase) => {
                let matchIndexes = phrase.match(words, corpus.facts)

                return matchIndexes && matchIndexes.indexOf(wordIndex) >= 0
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

                            (this.props.fact instanceof Word ?
                                'What Russian word is missing?'
                            :
                                'What form should the highlighed word be in?')

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
                            group.words.map((word: Word, index) => {
                                let explain = () => {
                                    this.explainWord(word, phraseForWord(index + group.startIndex))

                                    if (word === studiedWord && this.state.stage == Stage.REVEAL) {
                                        this.setState({ stage: Stage.CONFIRM })
                                    }
                                }

                                let className = ''
                                let text = word.jp

                                let formHint

                                if (this.isStudiedForm(word)) {
                                    studiedWord = word
                                    studiedIndex = index + group.startIndex

                                    if (this.props.fact instanceof InflectionFact) {
                                        if (!reveal) {
                                            formHint = this.getFormHint() 
                                        }

                                        if (!reveal) {
                                            text = (word as InflectedWord).getDefaultInflection().jp 
                                        }
                                    }
                                    else if (!reveal) {
                                        formHint = this.getFormHint() 

                                        formHint = studiedWord.getEnglish() + 
                                            (formHint ? ', ' + formHint : '')

                                        text = ''
                                    }

                                    if (reveal) {
                                        className += ' revealed' 
                                    }
                                    else {
                                        className += ' nominalized'
                                    }
                                }

                                if (capitalize && text) {
                                    text = text[0].toUpperCase() + text.substr(1)
                                }

                                capitalize = Words.SENTENCE_ENDINGS.indexOf(word.jp) >= 0
                                
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
                            <div className='button' onClick={ () => this.iWasRight(studiedWord, phraseForWord(studiedIndex)) }>I was right</div>
                            <div className='button' onClick={ () => this.iWasWrong(studiedWord, phraseForWord(studiedIndex)) }>I was wrong</div>
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

function isWordWithSpaceBefore(word: Word) {
    return (word.jp.length > 1 || Words.PUNCTUATION_NOT_PRECEDED_BY_SPACE.indexOf(word.jp) < 0)
}