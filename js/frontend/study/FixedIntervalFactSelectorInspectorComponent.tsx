/// <reference path="../../../typings/react/react.d.ts" />
/// <reference path="../../../typings/human-time.d.ts" />

import human = require('human-time')
import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import UnknownFactComponent from './UnknownFactComponent'
import Fact from '../../shared/fact/Fact'

import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'
import { INTERVAL_BY_REP_IN_MS, REPETITION_COUNT } from '../../shared/study/FixedIntervalFactSelector'

interface Props {
    knowledge: FixedIntervalFactSelector
}

interface State {
}

let React = { createElement: createElement }

export default class FixedIntervalFactSelectorInspectorComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
    }


    render() {
        return <div className='factSelectorInspector'>
                <h3>Studying</h3>
                <ul>{ 
                    this.props.knowledge.chooseFact(new Date()).map((fs) => {
                        return <li><b>{ fs.fact.getId() }</b>: { human(fs.debug['lastStudied'].time) }
                            , { fs.debug['lastStudied'].repetition } rep</li>
                    })
                }</ul>

                <h3>Not Yet Studying</h3>
                <ul>{ 
                    this.props.knowledge.notYetStudying().map((ls) => {
                        let interval = INTERVAL_BY_REP_IN_MS[Math.min(ls.repetition, REPETITION_COUNT-1)]

                        return <li><b>{ ls.fact }</b>: { human(ls.time) }
                            , { ls.repetition } rep, will study in { 
                                human(new Date(interval.min + ls.time.getTime())) } </li>
                    })
                }</ul>

                <h3>Not Longer Studying</h3>
                <ul>{ 
                    this.props.knowledge.noLongerStudying().map((ls) => {
                        let interval = INTERVAL_BY_REP_IN_MS[Math.min(ls.repetition, REPETITION_COUNT-1)]

                        return <li><b>{ ls.fact }</b>: { human(ls.time) }
                            , { ls.repetition } rep, not studying since { 
                                human(new Date(interval.max + ls.time.getTime())) } </li>
                    })
                }</ul>
            </div>
    }

}