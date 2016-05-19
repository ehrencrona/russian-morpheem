/// <reference path="../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../shared/Corpus'
import InflectedWord from '../shared/InflectedWord'
import Fact from '../shared/Fact'

import FactsEntryComponent from './FactsEntryComponent'
import FactComponent from './FactComponent'
import Tab from './Tab'
import AddWordComponent from './AddWordComponent'

import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    tab: Tab
}

const RECENT = 'recent'
const ALL = 'all'
const MISSING = 'last' 

interface State {
    add?: boolean,
    list?: string
}

let React = { createElement: createElement }

interface FactIndex {
    fact: Fact,
    index: number
}

export default class FactsComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            list: MISSING,
            add: false
        }
    }
    
    render() {
        let indexOfFacts : { [factId: string]: FactSentenceIndex } =
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        let factIndices: FactIndex[] = this.props.corpus.facts.facts.map((fact, index) => { 
            return { fact: fact, index: index } 
        })

        if (this.state.list == MISSING) {
            factIndices = factIndices.filter((factIndex) => {
                let indexEntry: FactSentenceIndex = indexOfFacts[factIndex.fact.getId()] || 
                    { ok: 0, easy: 0, hard: 0, factIndex: 0 }
                    
                return indexEntry.easy + indexEntry.ok < 8
            })
        }
        else if (this.state.list == RECENT) {
            let lastIds = this.props.tab.tabSet.getLastTabIds()
            
            factIndices = factIndices.filter((factIndex) =>
                lastIds.indexOf(factIndex.fact.getId()) >= 0)
        }

        let filterButton = (id, name) =>
            <div className={ 'button ' + (this.state.list == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ list: id }) }}>{ name }</div>

        return (<div>
                <div className='buttonBar'>
                    <div className='button' onClick={ () => { this.setState({ add: !this.state.add }) }}>+ Word</div>

                    { filterButton(MISSING, 'Missing') }
                    { filterButton(ALL, 'All') }
                    { filterButton(RECENT, 'Recent') }
                </div>

                {(
                    this.state.add ?
                    <AddWordComponent 
                        corpus={ this.props.corpus } 
                        onClose={ () => this.setState({ add: false }) }
                        tab={ this.props.tab }/>
                    : 
                    <div/>
                )}

                <ul className='facts'>
                {
                    factIndices.map((factIndex) => 
                        <FactsEntryComponent
                            key={ factIndex.fact.getId() }
                            fact={ factIndex.fact }
                            index={ factIndex.index }
                            indexOfFacts={ indexOfFacts }
                            corpus={ this.props.corpus }
                            tab={ this.props.tab }
                            onMove={ () => this.forceUpdate() }
                            />
                    )
                }
                </ul>
            </div>)
    }
}
