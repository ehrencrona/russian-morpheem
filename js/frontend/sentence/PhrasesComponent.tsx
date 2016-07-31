/// <reference path="../../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../../shared/Corpus'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/inflection/InflectionFact'

import Phrase from '../../shared/phrase/Phrase'
import Fact from '../../shared/fact/Fact'

import Tab from '../OpenTab'
import AddPhraseComponent from '../AddPhraseComponent'
import WordSearchComponent from '../WordSearchComponent'
import FilteredFactsListComponent from '../fact/FilteredFactsListComponent'

import { GrammaticalCase, CASES, getFormName } from '../../shared/inflection/InflectionForms'

import openFact from '../fact/openFact'

interface Props {
    corpus: Corpus,
    tab: Tab
}

const ADD_PHRASE = 'addPhrase'

interface State {
    case: GrammaticalCase,
    wordId: string
}

let React = { createElement: createElement }

export default class PhrasesComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            case: null,
            wordId: null
        }
    }
    
    render() {
        let caseButton = (grammaticalCase: GrammaticalCase) =>
            <div className={ 'button ' + (this.state.case == grammaticalCase ? ' selected' : '') } key={ grammaticalCase } 
                onClick={ () => { this.setState({ case: grammaticalCase, wordId: null }) }}>{ getFormName(CASES[grammaticalCase]) }</div>

        let list

        function sort(fact1: Fact, fact2: Fact) {
            return (fact1 as Phrase).description.localeCompare((fact2 as Phrase).description)
        }

        if (this.state.case != null) {
            list = <FilteredFactsListComponent
                corpus={ this.props.corpus }
                filter={ (factIndex) => {
                     let fact = factIndex.fact
                     
                     return fact instanceof Phrase && fact.hasCase(this.state.case)
                } }
                tab={ this.props.tab }
                sort={ sort }
                hideTypeFilter={ true } />
        }
        else {
            list = <FilteredFactsListComponent
                corpus={ this.props.corpus }
                filter={ (factIndex) => factIndex.fact instanceof Phrase }
                tab={ this.props.tab }
                sort={ sort }
                hideTypeFilter={ true } />
        }

        return (<div>
                <div className='buttonBar'>
                    <div className={ 'button ' + (this.state.case == null ? ' selected' : '') } 
                        onClick={ () => { this.setState({ case: null, wordId: null }) }}>All</div>
                        
                    {
                        Object.keys(CASES).map((grammaticalCase) => caseButton(parseInt(grammaticalCase) as GrammaticalCase))
                    }
                </div>

                {
                    list
                }
            </div>)
    }
}
