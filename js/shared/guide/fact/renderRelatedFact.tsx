import { Component, createElement } from 'react'

import Corpus from '../../../shared/Corpus'

import InflectableWord from '../../../shared/InflectableWord'
import { InflectionForm } from '../../../shared/inflection/InflectionForms'
import Word from '../../../shared/Word'
import Fact from '../../../shared/fact/Fact'
import Phrase from '../../../shared/phrase/Phrase'
import TagFact from '../../../shared/TagFact'

import FactLinkComponent from './FactLinkComponent'

let React = { createElement: createElement }

export default function renderRelatedFact(fact: Fact, corpus: Corpus, factLinkComponent: FactLinkComponent) {
    let inner

    if (fact instanceof InflectableWord) {
        inner = <span>
            { fact.toText() }
            { fact.pos == 'v' ?
                <div className='en'>
                    to { fact.getEnglish('inf') }
                    { corpus.facts.getTagsOfFact(fact).indexOf('perfective') >= 0 ? ' (perfective)' : '' }
                </div>
                :
                <div className='en'>
                    { fact.getEnglish() }
                </div>
            }                
        </span>
    }
    else if (fact instanceof Word) {
        inner = <span>
            { fact.toText() }
            <div className='en'>
                { fact.getEnglish() }
            </div>
        </span>
    }
    else if (fact instanceof Phrase) {
        inner = <span>
            { fact.description }
            
            <div className='en'>
                { fact.en }
            </div>
        </span>
    }
    else if (fact instanceof InflectionForm) {
        inner = <span>
            { fact.name }
            <div className='en'>
                (form)
            </div>
        </span>
    }
    else if (fact instanceof TagFact) {
        let factoid = corpus.factoids.getFactoid(fact)
        
        inner = <span>
            { (factoid && factoid.name) || fact.id }
            <div className='en'>
                (topic)
            </div>
        </span>
    }

    if (!inner) {
        return null
    }

    return <li className='clickable' key={ fact.getId() }>
        {
            React.createElement(factLinkComponent, { fact: fact }, inner)
        }
        </li>
}