import { getGuideFact } from '../../shared/guide/allGuideFacts';
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
}

interface ParsedSentence {
    words: ParsedWord[],
    sentence: ExternalSentence,
    difficulty: number
}

let React = { createElement: createElement }

export default class FactoidComponent extends Component<Props, State> {
    render() {
        let factoids = this.props.corpus.factoids
        let factoid = factoids.getFactoid(this.props.fact)        

        if (factoid.relations == null) {
            factoid.relations = []
        }
        
        let updated = () => {
            this.props.corpus.factoids.setFactoid(factoid, this.props.fact)

            this.forceUpdate()
        }

        let factSearch: FactSearchComponent

        return (<div>
            <h3>Title (optional)</h3>

            <input type='text' className='factoid' defaultValue={ factoid.name } onBlur={ (e) => {
                let name = (e.target as HTMLTextAreaElement).value

                if (factoid.name != name) {
                    factoid.name = name

                    factoids.setFactoid(factoid, this.props.fact)
                }
            } } />

            <h3>Meta description (optional) </h3>

            <textarea className='factoid description' defaultValue={ factoid.description } onBlur={ (e) => {
                let description = (e.target as HTMLTextAreaElement).value

                if (factoid.description != description) {
                    factoid.description = description

                    factoids.setFactoid(factoid, this.props.fact)
                }
            } } />

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
                    let related = getGuideFact(relation.fact, this.props.corpus)

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

                                let relatedFactoid = factoids.getFactoid(related)

                                relatedFactoid.relations = relatedFactoid.relations.filter(
                                    r => r.fact != this.props.fact.getId())
                                
                                factoids.setFactoid(relatedFactoid, related)
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

                        let relatedFactoid = factoids.getFactoid(fact)

                        relatedFactoid.relations.push({
                            fact: this.props.fact.getId()
                        })

                        factoids.setFactoid(relatedFactoid, fact)
                    } }
                />
            </div>
    
        </div>);
    }
}
