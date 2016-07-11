/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import LeitnerKnowledge from '../../shared/study/LeitnerKnowledge'
import LeitnerFactSelector from '../../shared/study/LeitnerFactSelector'
import OldestSentenceSelector from '../../shared/study/OldestSentenceSelector'
import LastSawSentenceKnowledge from '../../shared/study/LastSawSentenceKnowledge'

import { findSentencesForFact } from '../../shared/IndexSentencesByFact'

import InflectionFact from '../../shared/inflection/InflectionFact'
import Sentence from '../../shared/Sentence'

import Exposure from '../../shared/study/Exposure'
import FrontendExposures from './FrontendExposures'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'

import StudyComponent from './StudyComponent'
import TrivialKnowledge from '../../shared/study/TrivialKnowledge'

import ExplainFormComponent  from './ExplainFormComponent'

interface Props {
    corpus: Corpus,
    xrArgs: { [arg: string] : string }
}

interface State {
    sentence?: Sentence,
    fact?: InflectionFact,
}

let React = { createElement: createElement }


export default class StudyContainerComponent extends Component<Props, State> {
    exposures: FrontendExposures
    factKnowledge: LeitnerKnowledge
    sentenceKnowledge: LastSawSentenceKnowledge
    trivialKnowledge: TrivialKnowledge

    constructor(props) {
        super(props)

        this.state = {}
    }

    chooseSentence() {
        let selectableFacts = this.props.corpus.facts.facts 
            .filter(isStudiedFact)

        let nextFact = new LeitnerFactSelector(this.factKnowledge, selectableFacts).chooseFact() as InflectionFact

        console.log('next fact: ' + nextFact.getId())

        let factSentences = findSentencesForFact(nextFact, this.props.corpus.sentences, this.props.corpus.facts, 0)

        let sentence = new OldestSentenceSelector(this.sentenceKnowledge, this.props.corpus.facts).chooseSentence(factSentences)

        console.log('next sentence: ' + sentence.toString())

        this.setState({ sentence: sentence, fact: nextFact })
    }

    componentWillMount() {
        this.exposures = new FrontendExposures(this.props.xrArgs, this.props.corpus.lang)
        this.factKnowledge = new LeitnerKnowledge(this.props.corpus.facts)
        this.sentenceKnowledge = new LastSawSentenceKnowledge()
        this.trivialKnowledge = new TrivialKnowledge()

        this.factKnowledge.factFilter = isStudiedFact

        this.exposures
            .getExposures(-1)
            .then((exposures) => {                
                this.processExposures(exposures)

                this.chooseSentence()
            })
    }

    processExposures(exposures: Exposure[]) {
        this.factKnowledge.processExposures(exposures)
        this.sentenceKnowledge.processExposures(exposures)
        this.trivialKnowledge.processExposures(exposures)
    }

    onAnswer(exposures: Exposure[]) {
        this.exposures.registerExposures(exposures)
        this.processExposures(exposures)

        this.chooseSentence()
    }

    render() {
        if (this.state.sentence) {


            let knowledge = new LeitnerKnowledge(this.props.corpus.facts)

            knowledge.known['fem@genpl'] = 9;
            knowledge.known['femka2@genpl'] = 9;
            knowledge.known['neu@genpl'] = 9;
            knowledge.known['-mascь@genpl'] = 9;

            return <StudyComponent 
                sentence={ this.state.sentence }
                fact={ this.state.fact } 
                corpus={ this.props.corpus }
                factKnowledge={ this.factKnowledge }
                trivialKnowledge={ this.trivialKnowledge }
                onAnswer={ (exposures) => this.onAnswer(exposures)} />
            
        }
        else {
            return <div/>
        }
    }

}

function isStudiedFact(fact: Fact) {
    return fact instanceof InflectionFact &&
        fact.form != fact.inflection.defaultForm &&
        (fact.inflection.pos == 'n' || fact.inflection.pos == 'v' || fact.inflection.pos == 'adj')
}