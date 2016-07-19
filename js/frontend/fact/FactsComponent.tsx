/// <reference path="../../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../../shared/Corpus'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/inflection/InflectionFact'

import Fact from '../../shared/fact/Fact'

import { FactIndex } from './FactIndex'
import Tab from '../OpenTab'
import AddWordComponent from '../AddWordComponent'
import AddPhraseComponent from '../AddPhraseComponent'
import WordSearchComponent from '../WordSearchComponent'
import FactsTagComponent from './FactsTagComponent'
import IncompleteFactsListComponent from './IncompleteFactsListComponent'
import FilteredFactsListComponent from './FilteredFactsListComponent'
import MissingFactsListComponent from './MissingFactsListComponent'

import openFact from './openFact'

interface Props {
    corpus: Corpus,
    tab: Tab
}

const RECENT = 'recent'
const ALL = 'all'
const INCOMPLETE = 'incomplete' 
const SEARCH = 'search'
const TAGS = 'tags'
const MISSING = 'missing'

const ADD_WORD = 'addWord'
const ADD_PHRASE = 'addPhrase'

interface State {
    list?: string,
    tag?: string
}

let React = { createElement: createElement }

export default class FactsComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            list: (this.props.tab.getLastTabIds().length ? RECENT : INCOMPLETE),
        }
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
        else if (this.state.list == INCOMPLETE) {
            list = <IncompleteFactsListComponent
                corpus={ this.props.corpus }
                tab={ this.props.tab } />
        }
        else if (this.state.list == SEARCH) {
            list = <WordSearchComponent 
                corpus={ this.props.corpus }
                tab={ this.props.tab } 
                onWordSelect={ (word) => { 
                    openFact((word instanceof InflectedWord ? word.word : word), this.props.corpus, this.props.tab) 
                } } />
        }
        else if (this.state.list == ALL) {
            list = <FilteredFactsListComponent
                corpus={ this.props.corpus }
                filter={ (factIndex) => true }
                tab={ this.props.tab } />
        }
        else if (this.state.list == RECENT) {
            let lastIds = this.props.tab.getLastTabIds()

            list = <FilteredFactsListComponent
                corpus={ this.props.corpus }
                filter={ (factIndex) =>
                    lastIds.indexOf(factIndex.fact.getId()) >= 0
                }
                tab={ this.props.tab } />
        }
        else if (this.state.list == MISSING) {
            let lastIds = this.props.tab.getLastTabIds()

            list = <MissingFactsListComponent
                corpus={ this.props.corpus }
                tab={ this.props.tab } />
        }
        else if (this.state.list == ADD_WORD) {
            list = <AddWordComponent 
                corpus={ this.props.corpus } 
                onClose={ () => this.setState({ list: RECENT }) }
                tab={ this.props.tab }/>
        }
        else if (this.state.list == ADD_PHRASE) {
            list = <AddPhraseComponent 
                corpus={ this.props.corpus } 
                onClose={ () => this.setState({ list: RECENT }) }
                tab={ this.props.tab }/>
        }

        return (<div>
                <div className='buttonBar'>
                    <div>
                        { filterButton(ADD_WORD, '+ Word') }
                        { filterButton(ADD_PHRASE, '+ Phrase') }
                    </div>

                    <div>
                        { filterButton(INCOMPLETE, 'Incomplete') }
                        { filterButton(ALL, 'All') }
                        { filterButton(RECENT, 'Recent') }
                        { filterButton(SEARCH, 'Search') }
                        { filterButton(MISSING, 'Missing') }
                        { filterButton(TAGS, 'Tags') }
                    </div>
                </div>

                {
                    list
                }
            </div>)
    }
}
