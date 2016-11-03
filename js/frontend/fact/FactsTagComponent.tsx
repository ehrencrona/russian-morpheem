
import { Component,createElement } from 'react'
import Corpus from '../../shared/Corpus'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/inflection/InflectionFact'
import FilteredFactsListComponent from './FilteredFactsListComponent'

import { FactIndex } from './FactIndex'

import Tab from '../OpenTab'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
    tag?: string
}

let React = { createElement: createElement }

export default class FactsTagComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        let lastTag
        let allTags = this.props.corpus.facts.getAllTags()
        
        this.state = {
            tag: (this.state && this.state.tag) || localStorage.getItem('lastTag') || allTags[0]
        }
    }

    render() {
        let allTags = this.props.corpus.facts.getAllTags()

        allTags.sort()

        let filter: (factIndex: FactIndex) => boolean

        if (this.state.tag) {
            let factIdSet = this.props.corpus.facts.getFactIdsWithTag(this.state.tag)

            filter = (factIndex: FactIndex) =>
                factIdSet.has(factIndex.fact.getId())
        }
        else {
            filter = (factIndex: FactIndex) => false
        }

        let buttonForTag = (tag) =>
            <div className={ 'tag ' + (this.state.tag == tag ? ' selected' : '') }
                key={ tag }
                onClick={ () => { 
                    this.setState({ tag: tag })
                    localStorage.setItem('lastTag', tag)    
                }}>{ tag }</div>

        return (<div>
            <div className='tagFilter'>
            {
                allTags.map(buttonForTag)
            }
            </div>

            <FilteredFactsListComponent 
                corpus={ this.props.corpus }
                tab={ this.props.tab }
                filter={ filter }
                hideTypeFilter={ true } />
        </div>)
    }
}
