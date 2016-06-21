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
    startIndex: number
}

let React = { createElement: createElement }

const PAGE_SIZE = 200

export default class FilteredFactsListComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
        
        this.state = { startIndex: 0 }
    }

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
            <div>
                { (
                    factIndices.length > PAGE_SIZE ?

                        <ul className='paging'>{

                        Array.from(' '.repeat(Math.ceil(factIndices.length / PAGE_SIZE))).map(
                            (unused, pageIndex) => {
                                return <li className={ (pageIndex * PAGE_SIZE == this.state.startIndex ? 'current' : '')} 
                                    onClick={ () => this.setState({ startIndex: pageIndex * PAGE_SIZE })}>{ 
                                    (pageIndex * PAGE_SIZE) + ' - ' + 
                                        Math.min((pageIndex + 1) * PAGE_SIZE - 1, factIndices.length)}</li>
                            }
                        )

                        }</ul>

                    :

                    <div/>
                ) }

                <ul className='facts'>
                {
                    factIndices.slice(this.state.startIndex, this.state.startIndex + PAGE_SIZE).map((factIndex) => {
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
            </div>
        )
    }
}