/// <reference path="../../../typings/react/react.d.ts" />
import { Component, createElement } from 'react'

import { indexSentencesByFact, FactSentenceIndex } from '../../shared/IndexSentencesByFact'
import FactComponent from '../FactComponent'
import FactsEntryComponent from './FactsEntryComponent'
import { MISSING_INDEX } from '../../shared/Facts' 
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/Fact'
import InflectionFact from '../../shared/InflectionFact'
import InflectableWord from '../../shared/InflectableWord'
import Tab from '../Tab'

import { FactIndex } from './FactIndex'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

const PAGE_SIZE = 200

export default class MissingFactsListComponent extends Component<Props, State> {

    constructor(props) {
        super(props)
        
        this.state = { }
    }

    add(fact: Fact) {
        this.props.corpus.facts.add(fact)

        this.forceUpdate()
    }

    render() {
        let factsById: { [id:string]: InflectionFact } = {} 
        
        let corpus = this.props.corpus

        corpus.inflections.inflections.forEach((inflection) => {
            inflection.visitFacts((fact: Fact) => {
                if (corpus.facts.indexOf(fact) == MISSING_INDEX && fact instanceof InflectionFact) {
                    factsById[fact.getId()] = fact
                }
            })
        })

        let indexOfFacts : { [factId: string]: FactSentenceIndex } =
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        let factIds = Object.keys(factsById).sort((id1, id2) => 
            factsById[id1].form.localeCompare(factsById[id2].form)
        )

        return <ul className='facts'>
            { 
                factIds.map((factId) => 
                    <FactsEntryComponent
                        key={ factId } 
                        fact={ factsById[factId] }
                        indexOfFacts={ indexOfFacts }
                        index={ MISSING_INDEX }
                        corpus={ this.props.corpus }
                        tab={ this.props.tab } >
                        <div className='button' onClick={ () => this.add(factsById[factId])}>Add</div>
                    </FactsEntryComponent>)
            } 
        </ul>        
    }
}
