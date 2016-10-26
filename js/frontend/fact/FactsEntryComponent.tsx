

import {Component,createElement} from 'react'
import Corpus from '../../shared/Corpus'

import Tab from '../OpenTab'
import AddWordComponent from '../AddWordComponent'
import openFact from './openFact'

import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/inflection/InflectionFact'
import FactNameComponent from '../fact/FactNameComponent'

import { SentencesByFactIndex, FactSentences, DESIRED_SENTENCE_COUNT } from '../../shared/SentencesByFactIndex'
import { MISSING_INDEX } from '../../shared/fact/Facts' 

interface Props {
    fact: Fact,
    sentencesByFact : SentencesByFactIndex,
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

        openFact(fact, this.props.corpus, this.props.tab)
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
        let sentencesByFact = this.props.sentencesByFact      
        
        let indexEntry: FactSentences = sentencesByFact[fact.getId()] || 
            { ok: [], easy: [], hard: [], count: 0, factIndex: 0 }

        let easyLeft = DESIRED_SENTENCE_COUNT - (indexEntry.easy.length + indexEntry.ok.length)
        let left = easyLeft - indexEntry.hard.length

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

                    { ( left > 0 ? <span className='insufficient'>{ `+${easyLeft}` }</span> : '') }
                </span>

                { this.props.children }
            </li>
        )
    }
}