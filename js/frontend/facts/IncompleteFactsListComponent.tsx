/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/InflectionFact'
import FilteredFactsListComponent from './FilteredFactsListComponent'

import { indexSentencesByFact, FactSentenceIndex } from '../../shared/IndexSentencesByFact'		
 
import { FactIndex } from './FactIndex'

import Tab from '../Tab'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

export default class FactsMissingComponent extends Component<Props, State> {
    render() {
        let indexOfFacts : { [factId: string]: FactSentenceIndex } =		
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)		

        let filter = (factIndex) => {		
            let indexEntry: FactSentenceIndex = indexOfFacts[factIndex.fact.getId()] || 		
                { ok: 0, easy: 0, hard: 0, factIndex: 0 }		
                    
            return indexEntry.easy + indexEntry.ok + indexEntry.hard < 8		
        }

        return (
            <FilteredFactsListComponent 
                corpus={ this.props.corpus }
                tab={ this.props.tab }
                filter={ filter } />
        )
    }
}
