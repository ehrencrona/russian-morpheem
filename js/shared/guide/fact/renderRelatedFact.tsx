import { NamedWordForm, WordForm } from '../../inflection/WordForm';
import { Component, createElement } from 'react'

import Corpus from '../../../shared/Corpus'

import InflectableWord from '../../../shared/InflectableWord'
import InflectionForm from '../../../shared/inflection/InflectionForm'
import { PartOfSpeech as PoS } from '../../../shared/inflection/Dimensions'
import Word from '../../../shared/Word'
import Fact from '../../../shared/fact/Fact'
import Phrase from '../../../shared/phrase/Phrase'
import TagFact from '../../../shared/TagFact'

import FactLinkComponent from './FactLinkComponent'

let React = { createElement: createElement }

export default function renderRelatedFact(fact: Fact, corpus: Corpus, factLinkComponent: FactLinkComponent) {
    let inner

    let pair = (jp, en) => {
        return [
            <div key='jp' className='jp'>{ jp }</div>,
            <div key='en' className='en'>{ en }</div>
        ]
    }

    if (fact instanceof InflectableWord) {
        inner = pair(fact.toText(),
            fact.wordForm.pos == PoS.VERB ?
                fact.getEnglish('inf') + (corpus.facts.hasTag(fact, 'perfective') ? ' (perfective)' : '') 
                :
                fact.getEnglish())            
    }
    else if (fact instanceof Word) {
        inner = pair(
            fact.toText(),
            fact.getEnglish())
    }
    else if (fact instanceof Phrase) {
        inner = pair(
            fact.description,
            fact.en)
    }
    else if (fact instanceof InflectionForm) {
        inner = pair(
            fact.name,
            '(form)')
    }
    else if (fact instanceof NamedWordForm) {
        inner = pair(
            fact.name,
            '(word type)')
    }
    else if (fact instanceof TagFact) {
        let factoid = corpus.factoids.getFactoid(fact)
        
        inner = pair(
            (factoid && factoid.name) || fact.id,
            '(topic)')
    }

    if (!inner) {
        return null
    }

    return <li className='related clickable' key={ fact.getId() }>
        {
            React.createElement(factLinkComponent, { fact: fact }, inner)
        }
    </li>
}
