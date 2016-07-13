/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import Inflection from '../shared/inflection/Inflection'
import Phrase from '../shared/phrase/Phrase'

import InflectionFact from '../shared/inflection/InflectionFact'
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
const SHOW_COUNT = 3

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

        let easy: InflectedWord[] = [], hard: InflectedWord[] = []
        let more = false
        let foundCount = 0

        let facts = this.props.corpus.facts.facts

        for (let i = 0; i < facts.length && foundCount <= SHOW_COUNT; i++) {
            let fact = facts[i]
            
            if (fact instanceof InflectableWord && 
                inflectionIds.has(fact.inflection.id)) {
                
                if (foundCount == SHOW_COUNT) {
                    more = true
                }
                else {
                    (i > this.props.index + 10 ? hard : easy).push(fact.inflect(forFact.form))
                }

                foundCount++
            }
        }

        return { easy: easy, hard: hard, more: more }
    }

    render() {
        let fact = this.props.fact
        let examples

        if (fact instanceof InflectionFact) {
            examples = this.getExamples(fact)
        }

        if (examples && fact instanceof InflectionFact) { 
            return <span>
                { examples.easy.join(', ') } 
                { examples.hard.length ? <span className='hard'>{ (examples.easy.length ? ', ' : '') + examples.hard.join(', ') }</span>  : '' } 
                { (examples.more ? '...' : '') } 
                <span className='form'>{ fact.form }</span>
            </span>
        }
        else if (fact instanceof Phrase) {
            return <span>{ fact.description || fact.getId() }</span>
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
