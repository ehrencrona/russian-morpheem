/// <reference path="../../typings/react/react.d.ts" />

import {Component,createElement} from 'react';
import Corpus from '../shared/Corpus';
import InflectedWord from '../shared/InflectedWord';

import Fact from './FactComponent';
import { Tab } from './TabSetComponent';

import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class FactsComponent extends Component<Props, State> {
    render() {
        let indexOfFacts : { [factId: string]: FactSentenceIndex } =
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        return (<ul className='facts'>
            {
                this.props.corpus.facts.facts.map((fact, index) => {
                    let indexEntry: FactSentenceIndex = indexOfFacts[fact.getId()] || { ok: 0, easy: 0, hard: 0, factIndex: 0 }
                    let name = fact.getId();
                    
                    if (fact instanceof InflectedWord) {
                        name = fact.toString() + ' (' + fact.inflection.getId() + ')';
                    }

                    return <li 
                        key={ fact.getId() }
                        className='clickable'
                        draggable='true'
                        onDragOver={ (e) => e.preventDefault() }
                        onDrop={ (e) => {
                            let drag = JSON.parse(e.dataTransfer.getData('text'))

                            this.props.corpus.facts.move(
                                this.props.corpus.facts.get(drag.fact),
                                index)

                            this.setState({ corpus: this.props.corpus })
                        } }
                        onDragStart={ (e) => { 
                            e.dataTransfer.setData('text', JSON.stringify( { fact: fact.getId(), index: index } ));
                        } }
                        onClick={ () => this.props.tab.openTab(
                            <Fact fact={ fact } corpus={ this.props.corpus } tab={ null }/>,
                            fact.toString(),
                            fact.getId()
                        ) }>
                        <div className='index'><div className='number'>{ index + 1 }</div></div>

                        { name } 
                        
                        <span className={ 'count ' + ((indexEntry.easy + indexEntry.ok < 8) ? 'insufficient' : '') }>
                             ({indexEntry.easy}, {indexEntry.ok}, {indexEntry.hard})
                        </span>
                    </li>
                })
            }
            </ul>)
    }
}
