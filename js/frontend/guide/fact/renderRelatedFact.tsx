
import { Component, createElement } from 'react'

import Corpus from '../../../shared/Corpus'

import InflectableWord from '../../../shared/InflectableWord'
import Word from '../../../shared/Word'
import Fact from '../../../shared/fact/Fact'
import Phrase from '../../../shared/phrase/Phrase'

let React = { createElement: createElement }

export default function renderRelatedFact(fact: Fact, corpus: Corpus, onSelectFact: (fact: Fact) => void) {
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
        inner = <span>{ fact.description }</span>
    }

    if (!inner) {
        return null
    }

    return <li className='clickable' key={ fact.getId() } onClick={ (e) => {
            onSelectFact(fact)
            e.stopPropagation()
        }
    } >{
        inner
    }</li>
}
