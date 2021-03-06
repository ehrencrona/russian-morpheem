import ExplainSentenceComponent from '../ExplainSentenceComponent';
import getGuideUrl from '../getGuideUrl';
import { NamedWordForm } from '../../inflection/WordForm';

import Corpus from '../../../shared/Corpus'
import Fact from '../../../shared/fact/Fact'
import InflectedWord from '../../../shared/InflectedWord'
import InflectionFact from '../../../shared/inflection/InflectionFact'
import InflectionForm from '../../../shared/inflection/InflectionForm' 
import Phrase from '../../../shared/phrase/Phrase'
import PhraseCase from '../../../shared/phrase/PhraseCase'

import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import InflectableWord from '../../../shared/InflectableWord'
import { EndingTransform } from '../../../shared/Transforms'
import Word from '../../../shared/Word'
import Sentence from '../../../shared/Sentence'
import AbstractAnyWord from '../../../shared/AbstractAnyWord'

import InflectionFactComponent from './InflectionFactComponent'
import InflectionFormComponent from './InflectionFormComponent'
import WordFormComponent from './WordFormComponent'
import WordFactComponent from './WordFactComponent'
import PhraseFactComponent from './PhraseFactComponent'
import TagFactComponent from './TagFactComponent'

import TagFact from '../../../shared/TagFact'
import FactLinkComponent from './FactLinkComponent'

import { Component, createElement } from 'react'

interface Props {
    corpus: Corpus,
    fact: Fact
    context: InflectedWord
    knowledge: NaiveKnowledge
    factLinkComponent: FactLinkComponent
}

interface State {}

let React = { createElement: createElement }

export default function factComponent(props: Props) {
    let fact = props.fact

    let content

    if (fact instanceof InflectionFact) {
        content = <InflectionFactComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            inflection={ fact }
            word={ props.context } 
            factLinkComponent={ props.factLinkComponent }
        />
    }
    else if (fact instanceof InflectableWord || fact instanceof Word) {
        content = <WordFactComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            word={ fact }
            factLinkComponent={ props.factLinkComponent }
        />
    }
    else if (fact instanceof Phrase) {
        content = <PhraseFactComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            phrase={ fact }
            factLinkComponent={ props.factLinkComponent }
        />
    }
    else if (fact instanceof InflectionForm) {
        content = <InflectionFormComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            form={ fact }
            factLinkComponent={ props.factLinkComponent }
        />
    }
    else if (fact instanceof NamedWordForm) {
        content = <WordFormComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            form={ fact }
            factLinkComponent={ props.factLinkComponent }
        />
    }
    else if (fact instanceof TagFact) {
        content = <TagFactComponent 
            corpus={ props.corpus } 
            knowledge={ props.knowledge }
            fact={ fact }
            factLinkComponent={ props.factLinkComponent }
        />
    }
    else if (fact instanceof Sentence) {
        content = <ExplainSentenceComponent
            corpus={ props.corpus }
            sentence={ fact }
            factLinkComponent={ props.factLinkComponent }
        />
    }
    else {
        content = <div>Unhandled fact { fact.getId() }</div>
    }

    let canonical = getGuideUrl(fact)

    return <div className='content guide' onClick={ (e) => e.stopPropagation() }>
            {content}
            <div id='fb-root'/>
            <div className="fb-comments"
                data-href={ 'https://russian.morpheem.com' + canonical }
                data-width='100%'
                data-numposts='3'
                />
        </div>
}