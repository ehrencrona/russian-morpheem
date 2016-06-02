/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import Inflection from '../shared/Inflection'

import InflectionFact from '../shared/InflectionFact'
import InflectedWord from '../shared/InflectedWord'

import Sentence from '../shared/Sentence'
import InflectableWord from '../shared/InflectableWord'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Fact,
    index: number
}

interface State {
}

let React = { createElement: createElement }

export default class FactNameComponent extends Component<Props, State> {

    constructor(props) {
        super(props)
        
        this.state = {
            tab: 'words'
        }
    }

    getExamples(forFact: InflectionFact) {
        let inflectionIds = new Set()

        this.props.corpus.inflections.inflections.forEach((inflection) => {
            if (inflection.pos == forFact.inflection.pos &&
                inflection.getInflectionId(forFact.form) == forFact.inflection.id) {
                inflectionIds.add(inflection.id)
            }
        })

        let result: InflectedWord[] = []

        let facts = this.props.corpus.facts.facts
        let until = Math.min(facts.length, this.props.index + 10)

        for (let i = 0; i < until; i++) {
            let fact = facts[i]
            
            if (result.length < 3 &&
                fact instanceof InflectableWord && 
                inflectionIds.has(fact.inflection.id)) {
                result.push(fact.inflect(forFact.form))
            } 
        }

        return result
    }

    render() {
        let fact = this.props.fact
        let examples

        if (fact instanceof InflectionFact) {
            examples = this.getExamples(fact)
        }
            
        if (examples && fact instanceof InflectionFact) { 
            return <span>
                { examples.join(', ') + (examples.length == 3 ? '...' : '') } 
                <span className='form'>{ fact.form }</span>
            </span>
        }
        else {
            let name = fact.getId();
            
            if (fact instanceof InflectedWord) {
                name = fact.toString();
            }

            return <span>{ name }</span>
        }
    }
}
