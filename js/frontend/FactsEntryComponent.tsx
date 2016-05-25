/// <reference path="../../typings/react/react.d.ts" />

import {Component,createElement} from 'react'
import Corpus from '../shared/Corpus'

import Tab from './Tab'
import FactComponent from './FactComponent'
import AddWordComponent from './AddWordComponent'

import Fact from '../shared/Fact'
import InflectedWord from '../shared/InflectedWord'
import InflectionFact from '../shared/InflectionFact'

import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'

interface Props {
    fact: Fact,
    indexOfFacts : { [factId: string]: FactSentenceIndex },
    index: number,
    corpus: Corpus,
    tab: Tab,
    onMove?: () => any,
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

    getExamples(fact: InflectionFact) {
        let inflectionIds = new Set()

        this.props.corpus.inflections.inflections.forEach((inflection) => {
            if (inflection.pos == fact.inflection.pos &&
                inflection.getInflectionId(fact.form) == fact.inflection.id) {
                inflectionIds.add(inflection.id)
            }
        })

        let result: InflectedWord[] = []

        this.props.corpus.facts.facts.forEach((fact) => {
            if (result.length < 3 &&
                fact instanceof InflectedWord && 
                inflectionIds.has(fact.inflection.id)) {
                result.push(fact.infinitive.inflect(fact.form))
            } 
        })

        return result
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
        
        let left = 8 - (indexEntry.easy + indexEntry.ok)
        
        let examples
        
        if (fact instanceof InflectionFact) {
            examples = this.getExamples(fact)
        }
        
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
                    className='index'                            
                    draggable='true'
                    onDragStart={ (e) => { 
                        e.dataTransfer.setData('text', JSON.stringify( { fact: fact.getId(), index: index } ));
                    } }>
                    <div className='number'>{ index + 1 }</div>
                </div>

                <span className='clickable'>
                    { examples && fact instanceof InflectionFact ? 

                        <span>
                            { 
                                examples.join(', ') + 
                                    (examples.length == 3 ? '...' : '') 
                            }
                            <span className='form'>{ fact.form }</span> 
                        </span>

                        : 

                        name 

                    }
                    
                    { ( left > 0 ? <span className='insufficient'>{ `+${left}` }</span> : '') }
                </span>
            </li>
        )
    }
}