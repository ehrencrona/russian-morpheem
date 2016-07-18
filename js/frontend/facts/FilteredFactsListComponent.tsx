/// <reference path="../../../typings/react/react.d.ts" />
import { Component, createElement } from 'react'

import { indexSentencesByFact, SentencesByFactIndex } from '../../shared/SentencesByFactIndex'
import FactComponent from '../FactComponent'
import FactsEntryComponent from './FactsEntryComponent'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import Phrase from '../../shared/phrase/Phrase'

import InflectionFact from '../../shared/inflection/InflectionFact'
import UnstudiedWord from '../../shared/UnstudiedWord'
import InflectableWord from '../../shared/InflectableWord'

import Tab from '../OpenTab'

import { FactIndex } from './FactIndex'

interface Props {
    corpus: Corpus,
    tab: Tab,
    filter: (factIndex: FactIndex) => boolean
}

interface State {
    startIndex?: number,
    showInflectionFact?: boolean,
    showWords?: boolean,
    showPhrases?: boolean
}

let React = { createElement: createElement }

const PAGE_SIZE = 200

export default class FilteredFactsListComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = { startIndex: 0, showInflectionFact: true, showWords: true, showPhrases: true }
    }

    openFact(fact: Fact) {
        this.props.tab.openTab(
            <FactComponent fact={ fact } corpus={ this.props.corpus } tab={ this.props.tab }/>,
            fact.toString(),
            fact.getId()
        )
    }

    render() {
        let sentencesByFact : SentencesByFactIndex =
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        let factIndices: FactIndex[] = this.props.corpus.facts.facts.map((fact, index) => { 
            return { fact: fact, index: index } 
        })

        if (!this.state.showInflectionFact || !this.state.showWords) {
            factIndices = factIndices.filter((index) => {
                return (this.state.showInflectionFact && index.fact instanceof InflectionFact) || 
                    (this.state.showWords && (index.fact instanceof UnstudiedWord || index.fact instanceof InflectableWord)) ||
                    (this.state.showPhrases && index.fact instanceof Phrase) 
            })
        }

        factIndices = factIndices.filter(this.props.filter)

        return (
            <div>
                <ul className='formFilter'>
                    <li className={ (this.state.showInflectionFact ? 'active' : '') } 
                        onClick={ () => this.setState({ showInflectionFact: !this.state.showInflectionFact }) }>
                        Forms
                    </li>

                    <li className={ (this.state.showWords ? 'active' : '') } 
                        onClick={ () => this.setState({ showWords: !this.state.showWords }) }>
                        Words
                    </li>

                    <li className={ (this.state.showPhrases ? 'active' : '') } 
                        onClick={ () => this.setState({ showPhrases: !this.state.showPhrases }) }>
                        Phrases
                    </li>
                </ul>


                { (
                    factIndices.length > PAGE_SIZE ?

                        <ul className='paging'>{

                        Array.from(' '.repeat(Math.ceil(factIndices.length / PAGE_SIZE))).map(
                            (unused, pageIndex) => {
                                return <li className={ (pageIndex * PAGE_SIZE == this.state.startIndex ? 'current' : '')} 
                                    onClick={ () => this.setState({ startIndex: pageIndex * PAGE_SIZE })}>{ 
                                    (pageIndex * PAGE_SIZE) + ' - ' + 
                                        Math.min((pageIndex + 1) * PAGE_SIZE - 1, factIndices.length)}</li>
                            }
                        )

                        }</ul>

                    :

                    <div/>
                ) }

                <ul className='facts'>
                {
                    factIndices.slice(this.state.startIndex, this.state.startIndex + PAGE_SIZE).map((factIndex) => {
                        let fact = factIndex.fact
                                                    
                        return <FactsEntryComponent
                            key={ fact.getId() }
                            fact={ fact }
                            index={ factIndex.index }
                            sentencesByFact={ sentencesByFact }
                            corpus={ this.props.corpus }
                            tab={ this.props.tab }
                            onMove={ () => this.forceUpdate() }
                            />
                    })
                }
                </ul>
            </div>
        )
    }
}