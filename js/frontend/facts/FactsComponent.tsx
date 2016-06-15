/// <reference path="../../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../../shared/Corpus'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/InflectionFact'

import Fact from '../../shared/Fact'
import Sentence from '../../shared/Sentence'

import { FactIndex } from './FactIndex'
import FactComponent from '../FactComponent'
import SentenceComponent from '../SentenceComponent'
import Tab from '../Tab'
import AddWordComponent from '../AddWordComponent'
import WordSearchComponent from '../WordSearchComponent'
import FactsTagComponent from './FactsTagComponent'
import FactsMissingComponent from './FactsMissingComponent'
import FilteredFactsListComponent from './FilteredFactsListComponent'

interface Props {
    corpus: Corpus,
    tab: Tab
}

const RECENT = 'recent'
const ALL = 'all'
const MISSING = 'last' 
const SEARCH = 'search'
const TAGS = 'tags'
const ADD_WORD = 'addWord'

interface State {
    list?: string,
    tag?: string
}

let React = { createElement: createElement }

export default class FactsComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            list: (this.props.tab.tabSet.getLastTabIds().length ? RECENT : MISSING),
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
        let filterButton = (id, name) =>
            <div className={ 'button ' + (this.state.list == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ list: id }) }}>{ name }</div>

        let list

        if (this.state.list == TAGS) {
            list = <FactsTagComponent
                corpus={ this.props.corpus }
                tab={ this.props.tab } />
        }
        else if (this.state.list == MISSING) {
            list = <FactsMissingComponent
                corpus={ this.props.corpus }
                tab={ this.props.tab } />
        }
        else if (this.state.list == SEARCH) {
            list = <WordSearchComponent 
                corpus={ this.props.corpus }
                tab={ this.props.tab } 
                onWordSelect={ (word) => { 
                    this.openFact((word instanceof InflectedWord ? word.word : word)) 
                } } />
        }
        else if (this.state.list == ALL) {
            list = <FilteredFactsListComponent
                corpus={ this.props.corpus }
                filter={ (factIndex) => true }
                tab={ this.props.tab } />
        }
        else if (this.state.list == RECENT) {
            let lastIds = this.props.tab.tabSet.getLastTabIds()

            list = <FilteredFactsListComponent
                corpus={ this.props.corpus }
                filter={ (factIndex) =>
                    lastIds.indexOf(factIndex.fact.getId()) >= 0
                }
                tab={ this.props.tab } />
        }
        else if (this.state.list == ADD_WORD) {
            list = <AddWordComponent 
                corpus={ this.props.corpus } 
                onClose={ () => this.setState({ list: RECENT }) }
                tab={ this.props.tab }/>
        }

        return (<div>
                <div className='buttonBar'>
                    <div>
                        <div className='button' onClick={ () => { this.addSentence() }}>+ Sentence</div>
                        { filterButton(ADD_WORD, '+ Word') }
                    </div>

                    <div>
                        { filterButton(MISSING, 'Missing') }
                        { filterButton(ALL, 'All') }
                        { filterButton(RECENT, 'Recent') }
                        { filterButton(SEARCH, 'Search') }
                        { filterButton(TAGS, 'Tags') }
                    </div>
                </div>

                {
                    list
                }
            </div>)
    }
}
