import allGuideFacts from '../../shared/guide/allGuideFacts'

import Corpus from '../../shared/Corpus'
import TagFact from '../../shared/TagFact'

import Fact from '../../shared/fact/Fact'

import FactNameComponent from './FactNameComponent'
import { Component, createElement } from 'react'

import doesFactMatchQuery from './doesFactMatchQuery' 

const MAX_SUGGESTIONS = 50

interface Props {
    corpus: Corpus,
    onFactSelect: (Fact) => any,
    filter?: (Fact) => boolean
}

interface State {
    filterString?: string,
}

let React = { createElement: createElement }

export default class FactSearchComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
        
        this.state = {
            filterString: ''
        }
    }

    focus() {
        (this.refs['input'] as HTMLInputElement).focus()
    }

    clearFilters() {
        this.setState({ filterString: '' })
    }

    render() {
        let filterString = this.state.filterString.toLowerCase()
        let corpus = this.props.corpus
        
        let facts = []
        
        if (filterString) {
            let all = allGuideFacts(corpus)

            if (this.props.filter) {
                all = all.filter(this.props.filter)
            }

            facts = all.map(f => { return { fact: f, weight: doesFactMatchQuery(f, filterString) } })
                .filter(fw => fw.weight > 0)
                .sort((fw1, fw2) => fw2.weight - fw1.weight)
                .map(fw => fw.fact)
                .slice(0, MAX_SUGGESTIONS)
        }

        return (<div className='wordSearch'>
            <div className='filter'>
                <input type='text' lang={ this.props.corpus.lang } autoCapitalize='off' 
                        ref='input'
                        value={ this.state.filterString } 
                        onChange={ (event) => {
                    let target = event.target

                    if (target instanceof HTMLInputElement) {
                        this.setState({
                            filterString: target.value,
                        })
                    }
                }}/>
            </div>

            <div className='suggestions'>{
                facts.map(fact =>
                    <div className='suggestion'
                        onClick={ () => this.props.onFactSelect(fact) }
                        key={ fact.getId() }
                        ><FactNameComponent 
                            fact={ fact }
                            corpus={ this.props.corpus }
                            index={ this.props.corpus.facts.indexOf(fact) }
                        /></div>
                )
            }</div>
        </div>)
    }
}
