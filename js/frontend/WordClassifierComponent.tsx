/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import InflectableWord from '../shared/InflectableWord'
import Word from '../shared/Word'
import Tab from './OpenTab'
import FilteredFactsListComponent from './fact/FilteredFactsListComponent' 

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    word: Word | InflectableWord,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class WordClassifierComponent extends Component<Props, State> {

    render() {
        let current = <div/>

        if (this.props.word.classifier) {
            current = <div>This is <b>{this.props.word.getId()}</b>.</div>
        }

        let thisId = this.props.word.getIdWithoutClassifier()

        let alternatives: (Word|InflectableWord)[] = []

        this.props.corpus.facts.facts.forEach((fact) => {
            if ((fact instanceof Word || fact instanceof InflectableWord) && fact.getIdWithoutClassifier() == thisId) {
                alternatives.push(fact)
            }
        })

        return <div className='wordClassifier'><h3>Other Meanings</h3> 
            {current}

            <FilteredFactsListComponent 
                corpus={ this.props.corpus}
                tab={ this.props.tab }
                hideTypeFilter={ true }
                filter={ (factIndex) => {
                    let fact = factIndex.fact
                    
                    return (fact instanceof Word || fact instanceof InflectableWord) 
                        && fact.getIdWithoutClassifier() == thisId 
                        && fact.getId() != this.props.word.getId()
                } }
            />
        </div>
    }

}