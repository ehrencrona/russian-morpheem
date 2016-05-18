/// <reference path="../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../shared/Corpus'

import Tab from './Tab'
import FactComponent from './FactComponent'
import AddWordComponent from './AddWordComponent'

import Fact from '../shared/Fact'
import InflectedWord from '../shared/InflectedWord'

import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'

interface Props {
    fact: Fact,
    indexOfFacts : { [factId: string]: FactSentenceIndex },
    index: number,
    corpus: Corpus,
    tab: Tab
}

interface State {
    add: boolean
}

let React = { createElement: createElement }

export default class FactsEntryComponent extends Component<Props, State> {
    onClick(e) {
        let fact = this.props.fact

        this.props.tab.openTab(
            <FactComponent fact={ fact } corpus={ this.props.corpus } tab={ null }/>,
            fact.toString(),
            fact.getId()
        );
    }

    onDrop(e) {
        let fact = this.props.fact
        let drag = JSON.parse(e.dataTransfer.getData('text'))

        // happens on ios when shimming drag'n'drop
        if (drag.fact == fact.getId()) {
            this.onClick(e)
        }

        this.props.corpus.facts.move(
            this.props.corpus.facts.get(drag.fact),
            this.props.index)

        this.forceUpdate()
    }

    render() {
        let fact = this.props.fact
        let index = this.props.index
        let indexOfFacts = this.props.indexOfFacts      
        
        let indexEntry: FactSentenceIndex = indexOfFacts[fact.getId()] || 
            { ok: 0, easy: 0, hard: 0, factIndex: 0 }
        let name = fact.getId();
        
        if (fact instanceof InflectedWord) {
            name = fact.toString();
        }
        
        return ( 
            <li 
                onDragOver={ (e) => {
                    e.preventDefault()
                    e.dataTransfer.dropEffect = 'move'
                } }
                onDrop={ (e) => this.onDrop(e) }
                onClick={ (e) => this.onClick(e) }>
                
                <div 
                    className='index'                            
                    draggable='true'
                    onDragStart={ (e) => { 
                        e.dataTransfer.setData('text', JSON.stringify( { fact: fact.getId(), index: index } ));
                    } }>
                    <div className='number'>{ index + 1 }</div>
                </div>

                <span className={ 'clickable ' + ((indexEntry.easy + indexEntry.ok < 8) ? 'insufficient' : '') }>
                    { name }
                </span> 
            </li>
        )
    }
}