/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import LeitnerKnowledge from '../../shared/study/LeitnerKnowledge'
import LeitnerFactSelector from '../../shared/study/LeitnerFactSelector'
import OldestSentenceSelector from '../../shared/study/OldestSentenceSelector'
import LastSawSentenceKnowledge from '../../shared/study/LastSawSentenceKnowledge'
import { findSentencesForFact } from '../../shared/IndexSentencesByFact'
import InflectionFact from '../../shared/inflection/InflectionFact'
import FrontendExposures from './FrontendExposures'

interface Props {
    corpus: Corpus,
    xrArgs: { [arg: string] : string }
}

interface State {
}

let React = { createElement: createElement }

export default class StudyComponent extends Component<Props, State> {

    componentWillMount() {

        
        new FrontendExposures(this.props.xrArgs, this.props.corpus.lang)
            .getExposures(-1)
            .then((exposures) => {
                let factKnowledge = new LeitnerKnowledge(this.props.corpus.facts)
                
                factKnowledge.processExposures(exposures)

                let sentenceKnowledge = new LastSawSentenceKnowledge()
                
                sentenceKnowledge.processExposures(exposures)

                let selectableFacts = this.props.corpus.facts.facts 
                    .filter((fact) => fact instanceof InflectionFact)
                    .filter((fact: InflectionFact) => fact.inflection.pos == 'n' || fact.inflection.pos == 'v' || fact.inflection.pos == 'adj')

                let nextFact = new LeitnerFactSelector(factKnowledge, selectableFacts).chooseFact()

                console.log('next fact: ' + nextFact.getId())

                let factSentences = findSentencesForFact(nextFact, this.props.corpus.sentences, this.props.corpus.facts, 0)

                let sentence = new OldestSentenceSelector(sentenceKnowledge, this.props.corpus.facts).chooseSentence(factSentences)

                console.log('next sentence: ' + sentence.toString())
            })
        


    }

    render() {
        return <div>Study more</div>
    }

}