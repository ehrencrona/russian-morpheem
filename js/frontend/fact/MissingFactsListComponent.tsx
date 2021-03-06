
import { Component, createElement } from 'react'

import FactsEntryComponent from './FactsEntryComponent'
import { MISSING_INDEX } from '../../shared/fact/Facts' 
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import InflectionFact from '../../shared/inflection/InflectionFact'
import InflectableWord from '../../shared/InflectableWord'
import Tab from '../OpenTab'

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

        let sentencesByFact =
            this.props.corpus.sentences.getSentencesByFact(this.props.corpus.facts)

        let factIds = Object.keys(factsById).sort((id1, id2) => 
            factsById[id1].form.localeCompare(factsById[id2].form)
        )

        return <ul className='facts'>
            { 
                factIds.map((factId) => 
                    <FactsEntryComponent
                        key={ factId } 
                        fact={ factsById[factId] }
                        sentencesByFact={ sentencesByFact }
                        index={ MISSING_INDEX }
                        corpus={ this.props.corpus }
                        tab={ this.props.tab } >
                        <div className='button' onClick={ () => this.add(factsById[factId])}>Add</div>
                    </FactsEntryComponent>)
            } 
        </ul>        
    }
}
