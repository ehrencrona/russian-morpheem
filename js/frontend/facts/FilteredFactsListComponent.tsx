/// <reference path="../../../typings/react/react.d.ts" />
import { Component, createElement } from 'react'

import { indexSentencesByFact, FactSentenceIndex } from '../../shared/IndexSentencesByFact'
import FactComponent from '../FactComponent'
import FactsEntryComponent from './FactsEntryComponent'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/Fact'
import Tab from '../Tab'

import { FactIndex } from './FactIndex'

interface Props {
    corpus: Corpus,
    tab: Tab,
    filter: (factIndex: FactIndex) => boolean
}

interface State {
}

let React = { createElement: createElement }

export default class FilteredFactsListComponent extends Component<Props, State> {    
    openFact(fact: Fact) {
        this.props.tab.openTab(
            <FactComponent fact={ fact } corpus={ this.props.corpus } tab={ this.props.tab }/>,
            fact.toString(),
            fact.getId()
        )
    }

    render() {
        let indexOfFacts : { [factId: string]: FactSentenceIndex } =
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        let factIndices: FactIndex[] = this.props.corpus.facts.facts.map((fact, index) => { 
            return { fact: fact, index: index } 
        })

        factIndices = factIndices.filter(this.props.filter)

        return (
            <ul className='facts'>
            {
                factIndices.map((factIndex) => {
                    let fact = factIndex.fact
                                                
                    return <FactsEntryComponent
                        key={ fact.getId() }
                        fact={ fact }
                        index={ factIndex.index }
                        indexOfFacts={ indexOfFacts }
                        corpus={ this.props.corpus }
                        tab={ this.props.tab }
                        onMove={ () => this.forceUpdate() }
                        />
                })
            }
            </ul>
        )
    }
}