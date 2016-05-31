/// <reference path="../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../shared/Corpus'
import InflectedWord from '../shared/InflectedWord'
import InflectionFact from '../shared/InflectionFact'

import Fact from '../shared/Fact'
import Sentence from '../shared/Sentence'

import FactsEntryComponent from './FactsEntryComponent'
import FactComponent from './FactComponent'
import SentenceComponent from './SentenceComponent'
import Tab from './Tab'
import AddWordComponent from './AddWordComponent'
import WordSearchComponent from './WordSearchComponent'

import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    tab: Tab
}

const RECENT = 'recent'
const ALL = 'all'
const MISSING = 'last' 
const SEARCH = 'search'

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
            list: (this.props.tab.tabSet.getLastTabIds().length ? RECENT : MISSING),
            add: false
        }
    }
    
    addSentence() {
        let sentence = new Sentence([ ], null)
        
        this.props.corpus.sentences.add(sentence)
        
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
    }
    
    openFact(fact: Fact) {
        this.props.tab.openTab(
            <FactComponent fact={ fact } corpus={ this.props.corpus } tab={ null }/>,
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

        if (this.state.list == MISSING) {
            factIndices = factIndices.filter((factIndex) => {
                let indexEntry: FactSentenceIndex = indexOfFacts[factIndex.fact.getId()] || 
                    { ok: 0, easy: 0, hard: 0, factIndex: 0 }
                    
                return indexEntry.easy + indexEntry.ok < 8
            })
        }
        else if (this.state.list == RECENT) {
            let lastIds = this.props.tab.tabSet.getLastTabIds()
            
            factIndices = factIndices
                .filter((factIndex) =>
                    lastIds.indexOf(factIndex.fact.getId()) >= 0)
        }

        let filterButton = (id, name) =>
            <div className={ 'button ' + (this.state.list == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ list: id }) }}>{ name }</div>

        return (<div>
                <div className='buttonBar'>
                    <div className='button' onClick={ () => { this.setState({ add: !this.state.add }) }}>+ Word</div>
                    <div className='button' onClick={ () => { this.addSentence() }}>+ Sentence</div>

                    <div className='separator'></div>

                    { filterButton(MISSING, 'Missing') }
                    { filterButton(ALL, 'All') }
                    { filterButton(RECENT, 'Recent') }
                    { filterButton(SEARCH, 'Search') }
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

                { this.state.list == SEARCH ?

                    <WordSearchComponent 
                        corpus={ this.props.corpus }
                        tab={ this.props.tab } 
                        onWordSelect={ (word) => { 
                            this.openFact((word instanceof InflectedWord ? word.word : word)) 
                        } } />
    
                    :            

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
                }
            </div>)
    }
}
