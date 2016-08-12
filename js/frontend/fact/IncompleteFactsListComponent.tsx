

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/inflection/InflectionFact'
import FilteredFactsListComponent from './FilteredFactsListComponent'

import { SentencesByFactIndex, FactSentences } from '../../shared/SentencesByFactIndex'		
 
import { FactIndex } from './FactIndex'

import Tab from '../OpenTab'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

export default class FactsMissingComponent extends Component<Props, State> {
    render() {
        let indexOfFacts : SentencesByFactIndex =		
            this.props.corpus.sentences.getSentencesByFact(this.props.corpus.facts)

        let filter = (factIndex) => {		
            let indexEntry: FactSentences = indexOfFacts[factIndex.fact.getId()]
                    
            return !indexEntry || indexEntry.count < 8		
        }

        return (
            <FilteredFactsListComponent 
                corpus={ this.props.corpus }
                tab={ this.props.tab }
                filter={ filter } />
        )
    }
}
