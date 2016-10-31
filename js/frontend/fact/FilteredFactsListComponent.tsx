
import { Component, createElement } from 'react'

import { SentencesByFactIndex } from '../../shared/SentencesByFactIndex'
import FactsEntryComponent from './FactsEntryComponent'
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import Phrase from '../../shared/phrase/Phrase'

import { InflectionForm } from '../../shared/inflection/InflectionForms'
import InflectionFact from '../../shared/inflection/InflectionFact'
import Word from '../../shared/Word'
import InflectableWord from '../../shared/InflectableWord'
import TagFact from '../../shared/TagFact'

import Tab from '../OpenTab'

import { FactIndex } from './FactIndex'

interface Props {
    corpus: Corpus,
    tab: Tab,
    filter: (factIndex: FactIndex) => boolean,
    hideTypeFilter?: boolean,
    sort?: (fact1: Fact, fact2: Fact) => number 
    factEntryChildFactory?: (fact: Fact) => any
}

interface State {
    startIndex?: number,
    showInflectionFact?: boolean,
    showInflectionForm?: boolean,
    showWords?: boolean,
    showTags?: boolean,
    showPhrases?: boolean
}

let React = { createElement: createElement }

const PAGE_SIZE = 200

export default class FilteredFactsListComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = { 
            startIndex: 0, 
            showInflectionFact: true, 
            showInflectionForm: true, 
            showWords: true, 
            showPhrases: true,
            showTags: true
        }
    }

    render() {
        let sentencesByFact : SentencesByFactIndex =
            this.props.corpus.sentences.getSentencesByFact(this.props.corpus.facts)

        let factIndices: FactIndex[] = this.props.corpus.facts.facts.map((fact, index) => { 
            return { fact: fact, index: index } 
        })

        if (!this.state.showInflectionFact || !this.state.showWords) {
            factIndices = factIndices.filter((index) => 
                (this.state.showInflectionFact && index.fact instanceof InflectionFact) || 
                (this.state.showWords && (index.fact instanceof Word || index.fact instanceof InflectableWord)) ||
                (this.state.showPhrases && index.fact instanceof Phrase) ||
                (this.state.showInflectionForm && index.fact instanceof InflectionForm) || 
                (this.state.showTags && index.fact instanceof TagFact)  
            )
        }

        factIndices = factIndices.filter(this.props.filter)

        if (this.props.sort) {
            factIndices = factIndices.sort((i1, i2) => this.props.sort(i1.fact, i2.fact))
        }

        return (
            <div>
                {!this.props.hideTypeFilter ? 
                    <ul className='formFilter'>
                        <li className={ (this.state.showInflectionFact ? 'active' : '') } 
                            onClick={ () => this.setState({ showInflectionFact: !this.state.showInflectionFact }) }>
                            Endings
                        </li>

                        <li className={ (this.state.showWords ? 'active' : '') } 
                            onClick={ () => this.setState({ showWords: !this.state.showWords }) }>
                            Words
                        </li>

                        <li className={ (this.state.showPhrases ? 'active' : '') } 
                            onClick={ () => this.setState({ showPhrases: !this.state.showPhrases }) }>
                            Phrases
                        </li>

                        <li className={ (this.state.showInflectionForm ? 'active' : '') } 
                            onClick={ () => this.setState({ showPhrases: !this.state.showInflectionForm }) }>
                            Forms
                        </li>

                        <li className={ (this.state.showInflectionForm ? 'active' : '') } 
                            onClick={ () => this.setState({ showPhrases: !this.state.showInflectionForm }) }>
                            Forms
                        </li>
                    </ul>
                    : 
                    <div/>
                }

                { (factIndices.length > PAGE_SIZE ?

                        <ul className='paging'>{

                        Array.from(' '.repeat(Math.ceil(factIndices.length / PAGE_SIZE))).map(
                            (unused, pageIndex) => {
                                return <li key={ 'page' + pageIndex}
                                    className={ (pageIndex * PAGE_SIZE == this.state.startIndex ? 'current' : '')} 
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
                            >{ this.props.factEntryChildFactory ? this.props.factEntryChildFactory(fact) : null 
                            }</FactsEntryComponent>
                    })
                }
                </ul>
            </div>
        )
    }
}