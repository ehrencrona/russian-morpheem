/// <reference path="../../../typings/react/react.d.ts" />
/// <reference path="../../../typings/human-time.d.ts" />

import human = require('human-time')
import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import UnknownFactComponent from './UnknownFactComponent'
import Fact from '../../shared/fact/Fact'

import FactNameComponent from '../FactNameComponent'
import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'
import { INTERVAL_BY_REP_IN_MS, REPETITION_COUNT } from '../../shared/study/FixedIntervalFactSelector'

interface Props {
    knowledge: FixedIntervalFactSelector
    corpus: Corpus
}

interface State {
}

let React = { createElement: createElement }

export default class FixedIntervalFactSelectorInspectorComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
    }

    render() {
        let facts = this.props.corpus.facts

        let renderLastStudied = (ls) => {
            let interval = INTERVAL_BY_REP_IN_MS[Math.min(ls.repetition, REPETITION_COUNT-1)]
            let fact = facts.get(ls.fact)

            if (fact) {
                return <li key={ fact.getId() }>
                    <div className='index'>
                        <div className='number'> 
                            { ls.repetition }
                        </div>
                    </div>

                    <div className='fact'>
                        <FactNameComponent fact={ fact } index={0} corpus={ this.props.corpus } />
                    </div>

                    <div className='details'>
                        Last saw { human(ls.time) }. Studying between { human(new Date(interval.min + ls.time.getTime())) } and { human(new Date(interval.max + ls.time.getTime())) } 
                    </div> 
                </li>
            }
            else {
                return <li>{ ls.fact } ???</li>
            }
        }

        return <div className='factSelectorInspector'>
                <h3>Studying</h3>
                <ul className='facts'>{ 
                    this.props.knowledge.chooseFact(new Date()).map((fs) => 
                        renderLastStudied({
                            fact: fs.fact.getId(),
                            repetition: fs.debug['lastStudied'].repetition,
                            time: fs.debug['lastStudied'].time 
                        })
                    )
                }</ul>

                <h3>Not Yet Studying</h3>
                <ul className='facts'>{ 
                    this.props.knowledge.notYetStudying().map(renderLastStudied)
                }</ul>

                <h3>Not Longer Studying</h3>
                <ul className='facts'>{ 
                    this.props.knowledge.noLongerStudying().map(renderLastStudied)
                }</ul>
            </div>
    }

}