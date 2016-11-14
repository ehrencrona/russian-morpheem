
import { Component,createElement } from 'react'
import Corpus from '../../shared/Corpus'
import AbstractAnyWord from '../../shared/AbstractAnyWord'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/inflection/InflectionFact'
import FilteredFactsListComponent from './FilteredFactsListComponent'
import WORD_FORMS from '../../shared/inflection/WordForms'
import { WordForm, NamedWordForm } from '../../shared/inflection/WordForm'

import { FactIndex } from './FactIndex'

import Tab from '../OpenTab'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
    form?: WordForm
}

let React = { createElement: createElement }

export default class FactsFormComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        let lastForm
        
        this.state = {
            form: null
        }
    }

    render() {
        let allForms: NamedWordForm[] = Object.keys(WORD_FORMS).map(i => WORD_FORMS[i])

        allForms.sort((f1, f2) => f1.id.localeCompare(f2.id))

        let filter: (factIndex: FactIndex) => boolean

        if (this.state.form) {
            filter = (factIndex: FactIndex) => {
                let fact = factIndex.fact 
                
                return fact instanceof AbstractAnyWord 
                    && fact.wordForm.matches(this.state.form)
            }
        }
        else {
            filter = (factIndex: FactIndex) => false
        }

        let buttonForForm = (form: NamedWordForm) =>
            <div className={ 'tag ' + (this.state.form === form ? ' selected' : '') }
                key={ form.id }
                onClick={ () => { 
                    this.setState({ form: form })
                }}>{ form.id }</div>

        return (<div>
            <div className='tagFilter'>
            {
                allForms.map(buttonForForm)
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
