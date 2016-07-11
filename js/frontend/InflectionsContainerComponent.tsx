/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import InflectedWord from '../shared/InflectedWord'
import InflectableWord from '../shared/InflectableWord'
import Inflection from '../shared/inflection/Inflection'
import InflectionsComponent from './InflectionsComponent'

import Tab from './Tab'
import FactComponent from './FactComponent'
import Word from '../shared/Word'
import getLanguage from './getLanguage'

import { Component, createElement } from 'react';
import INFLECTION_FORMS from '../shared/inflection/InflectionForms'
import { MISSING_INDEX } from '../shared/fact/Facts'

interface Props {
    corpus: Corpus,
    inflection: Inflection,
    tab: Tab,
    word?: InflectableWord,
    onSelect?: (word: Word) => any
    hideForms?: Object
}

interface State {
}

let React = { createElement: createElement }

export default class InflectionsContainerComponent extends Component<Props, State> {
    openForm(form) {
        let fact = this.props.inflection.getFact(form)

        this.props.tab.openTab(
            <FactComponent corpus={ this.props.corpus } tab={ this.props.tab } 
                fact={ fact }/>, fact.getId(), fact.getId()
        ) 
    }
    
    addFact(form: string) {
        let fact = this.props.inflection.getFact(form)
        
        this.props.corpus.facts.add(fact)
        
        this.forceUpdate()
    }

    onSelect(form) {
        if (this.props.word && this.props.onSelect) {
            this.props.onSelect(this.props.word.inflect(form))
        }
        else {
            this.openForm(form)
        }
    }

    render() {

        return <InflectionsComponent 
            corpus={ this.props.corpus } 
            inflection={ this.props.inflection } 
            word={ this.props.word }
            allowAdd={ true }
            onSelect={ (form) => this.onSelect(form) }
            hideForms={ this.props.hideForms } 
            />

    }
}