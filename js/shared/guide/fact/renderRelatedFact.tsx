import { NamedWordForm, WordForm } from '../../inflection/WordForm';
import { Component, createElement } from 'react'

import Corpus from '../../../shared/Corpus'

import InflectableWord from '../../../shared/InflectableWord'
import InflectionForm from '../../../shared/inflection/InflectionForm'
import { Aspect, PartOfSpeech as PoS } from '../../../shared/inflection/Dimensions';
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
                fact.getEnglish('inf') + 
                    (fact.wordForm.aspect == Aspect.PERFECTIVE ? ' (perfective)' : '') 
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
        let isCase = fact.grammaticalCase && 
            new InflectionForm('', '', { grammaticalCase: fact.grammaticalCase }).equals(fact)

        inner = pair(
            fact.name,
            isCase ? '(case)' : '(form)')
    }
    else if (fact instanceof NamedWordForm) {
        let type = 'word type'

        if (fact.pos && 
            fact.equals({ pos: fact.pos })) {
            type = 'part of speech'
        }
        else if (fact.aspect && 
            fact.equals({ aspect: fact.aspect })) {
            type = 'aspect'
        }

        inner = pair(
            fact.name,
            `(${type})`)
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
