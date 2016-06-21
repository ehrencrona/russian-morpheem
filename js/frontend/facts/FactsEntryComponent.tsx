/// <reference path="../../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../../shared/Corpus'

import Tab from '../Tab'
import FactComponent from '../FactComponent'
import AddWordComponent from '../AddWordComponent'

import Fact from '../../shared/Fact'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/InflectionFact'
import FactNameComponent from '../FactNameComponent'

import { indexSentencesByFact, FactSentenceIndex } from '../../shared/IndexSentencesByFact'
import { MISSING_INDEX } from '../../shared/Facts' 

interface Props {
    fact: Fact,
    indexOfFacts : { [factId: string]: FactSentenceIndex },
    index: number,
    corpus: Corpus,
    tab: Tab,
    onMove?: () => any
}

interface State {
    add?: boolean,
    dragTarget?: boolean
}

let React = { createElement: createElement }

export default class FactsEntryComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
        
        this.state = {}
    }

    onClick(e) {
        let fact = this.props.fact

        this.props.tab.openTab(
            <FactComponent fact={ fact } corpus={ this.props.corpus } tab={ null }/>,
            fact.toString(),
            fact.getId()
        )
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

        if (this.props.onMove) {
            this.props.onMove()
        }

        this.setState({ dragTarget: false })
    }

    render() {
        let fact = this.props.fact
        let index = this.props.index
        let indexOfFacts = this.props.indexOfFacts      
        
        let indexEntry: FactSentenceIndex = indexOfFacts[fact.getId()] || 
            { ok: 0, easy: 0, hard: 0, factIndex: 0 }

        let left = 8 - (indexEntry.easy + indexEntry.ok)
        
        return ( 
            <li 
                className={ this.state.dragTarget ? 'drag-target' : '' }
                onDragOver={ (e) => {
                    this.setState({ dragTarget: true })
                    e.preventDefault()
                } }
                onDragLeave={ (e) => {
                    this.setState({ dragTarget: false })
                } }
                onDrop={ (e) => this.onDrop(e) }
                onClick={ (e) => this.onClick(e) }>
                
                <div 
                    className={ 'index' + (index == MISSING_INDEX ? ' missing' : '') }                            
                    draggable={ index != MISSING_INDEX }
                    onDragStart={ (e) => { 
                        e.dataTransfer.setData('text', JSON.stringify( { fact: fact.getId(), index: index } ));
                    } }>
                    <div className='number'>{ index == MISSING_INDEX ? 'n/a' : index + 1 }</div>
                </div>

                <span className='clickable'>
                    <FactNameComponent fact={ fact } index={ index } corpus={ this.props.corpus} />
                    
                    { ( left > 0 ? <span className='insufficient'>{ `+${left}` }</span> : '') }
                </span>
            </li>
        )
    }
}