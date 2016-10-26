import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import { MISSING_INDEX } from '../../shared/fact/Facts'
import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import InflectedWord from '../../shared/InflectedWord'
import { ExternalSentence } from '../../shared/external/ExternalSentence'
import { parseSentenceToWords, ParsedWord } from '../../shared/external/parseSentenceToWords'
import { Factoid } from '../../shared/metadata/Factoids'

import FactsEntryComponent from '../fact/FactsEntryComponent'
import { Component, createElement } from 'react';

import FactSearchComponent from '../fact/FactSearchComponent'
import SentenceComponent from '../sentence/SentenceComponent'
import Tab from '../OpenTab'

interface Props {
    corpus: Corpus,
    fact: Fact,
    tab: Tab
}

interface State {
    factoid?: Factoid
}

interface ParsedSentence {
    words: ParsedWord[],
    sentence: ExternalSentence,
    difficulty: number
}

let React = { createElement: createElement }

export default class FactoidComponent extends Component<Props, State> {
    componentDidMount() {
        this.props.corpus.factoids.getFactoid(this.props.fact).then((factoid) => {

            if (factoid.relations == null) {
                factoid.relations = []
            }

            this.setState({
                factoid: factoid
            })

        })
    }

    render() {
        if (!this.state) {
            return <div/>
        }

        let factoid = this.state.factoid 
        let factoids = this.props.corpus.factoids
        
        let updated = () => {
            this.props.corpus.factoids.setFactoid(factoid, this.props.fact)

            this.setState({
                factoid: this.state.factoid
            })
        }

        let factSearch: FactSearchComponent

        return (<div>
            <h3>Explanation</h3>

            <textarea className='factoid' defaultValue={ factoid.explanation } onBlur={ (e) => {
                let explanation = (e.target as HTMLTextAreaElement).value

                if (factoid.explanation != explanation) {
                    factoid.explanation = explanation

                    factoids.setFactoid(factoid, this.props.fact)
                }
            } } />

            <h3>Related</h3>

            <ul className='factoidRelated'>{

                factoid.relations.map(relation => {
                    let related = this.props.corpus.facts.get(relation.fact)

                    if (related) {
                        return <FactsEntryComponent 
                            key={ relation.fact }
                            corpus={ this.props.corpus }
                            index={ this.props.corpus.facts.indexOf(related) }
                            sentencesByFact={ this.props.corpus.sentences.getSentencesByFact(this.props.corpus.facts) }
                            fact={ related } 
                            tab={ this.props.tab } >
                            <div className='button' onClick={ (e) => {
                                factoid.relations = factoid.relations.filter(r => r !== relation)

                                updated()
                                e.stopPropagation()

                                let relatedFact = this.props.corpus.facts.get(relation.fact)

                                factoids.getFactoid(relatedFact).then(relatedFactoid => {
                                    relatedFactoid.relations = relatedFactoid.relations.filter(
                                        r => r.fact != this.props.fact.getId())
                                    
                                    factoids.setFactoid(relatedFactoid, relatedFact)
                                })
                            } }>Remove</div>
                        </FactsEntryComponent>
                    }
                    else {
                        return <li><i>Unknown fact { relation.fact }</i></li>
                    }

                })

            }</ul>
            
            <div>
                <FactSearchComponent
                    corpus={ this.props.corpus }
                    ref={ (ws) => factSearch = ws }
                    onFactSelect={ (fact) => {

                        factoid.relations.push({
                            fact: fact.getId()
                        })

                        updated()

                        factSearch.clearFilters()

                        factoids.getFactoid(fact).then(relatedFactoid => {
                            relatedFactoid.relations.push({
                                fact: this.props.fact.getId()
                            })

                            factoids.setFactoid(relatedFactoid, fact)
                        })

                    } }
                    tab={ this.props.tab } 
                />
            </div>
    
        </div>);
    }
}
