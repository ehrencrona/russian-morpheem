/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import Inflection from '../shared/Inflection'

import InflectionFact from '../shared/InflectionFact'

import Sentence from '../shared/Sentence'
import InflectedWord from '../shared/InflectedWord'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Fact,
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
