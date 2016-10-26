import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import Word from '../shared/Word'
import UnparsedWord from '../shared/UnparsedWord'
import InflectedWord from '../shared/InflectedWord'
import InflectableWord from '../shared/InflectableWord'
import InflectionFact from '../shared/inflection/InflectionFact'
import { FORMS } from '../shared/inflection/InflectionForms'
import Phrase from '../shared/phrase/Phrase'
import AnyWord from '../shared/AnyWord'
import Tab from './OpenTab'
import InflectionsContainerComponent from './InflectionsContainerComponent'
import FactNameComponent from './FactNameComponent'
import { Component, createElement } from 'react'

const MAX_SUGGESTIONS = 50

interface Props {
    corpus: Corpus,
    tab: Tab,
    onFactSelect: (Fact) => any,
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

    matches(fact: Fact, filter: string): boolean {
        if (fact.getId().indexOf(filter) >= 0) {
            return true
        }

        if (fact instanceof Word) {
            if (fact.jp.substr(0, filter.length).toLowerCase() == filter ||
                fact.getEnglish().indexOf(filter) >= 0) {
                return true
            }
        }
        else if (fact instanceof InflectableWord) {
            if (fact.getDefaultInflection().jp.substr(0, filter.length).toLowerCase() == filter) {
                return true
            }

            if (fact.getEnglish().indexOf(filter) >= 0) {
                return true
            }
        }
        else if (fact instanceof InflectionFact) {
            if (fact.inflection.endings[fact.form].suffix.indexOf(filter) >= 0) {
                return true
            }

            if (FORMS[fact.form].name.indexOf(filter) >= 0) {
                return true
            }
        }
        else if (fact instanceof Phrase) {
            if (fact.description.indexOf(filter) >= 0) {
                return true
            }

            if (fact.en.indexOf(filter) >= 0) {
                return true
            }
        }

        return false
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
            facts = this.props.corpus.facts.facts.filter(f => this.matches(f, filterString)).slice(0, MAX_SUGGESTIONS)
        }
        
        return (<div className='wordSearch'>
            <div className='filter'>
                <input type='text' lang={ this.props.corpus.lang } autoCapitalize='off' 
                        ref='input'
                        value={ this.state.filterString } onChange={ (event) => {
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
