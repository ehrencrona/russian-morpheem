/// <reference path="../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../shared/Corpus'

import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
}

interface State {
}

let React = { createElement: createElement }

export default class StatsComponent extends Component<Props, State> {
    
    render() {
        let corpus = this.props.corpus 

        let indexOfFacts : { [factId: string]: FactSentenceIndex } =
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        let factsWithEnoughSentences = 0

        for (let fact of corpus.facts.facts) {
            let i = indexOfFacts[fact.getId()]
            
            if (i && i.easy + i.ok >= 8) {
                factsWithEnoughSentences++
            }
        }

        return <ul className='stats'>
            <li>
                <b>{ corpus.sentences.sentences.length }</b> sentences
            </li>
            <li>
                <b>{ corpus.facts.facts.length }</b> facts
            </li>
            <li> 
                <b>{ factsWithEnoughSentences }</b> facts have enough sentences
            </li>
        </ul>
    }        
}
