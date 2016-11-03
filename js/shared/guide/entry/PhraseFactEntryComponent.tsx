
import Phrase from '../../../shared/phrase/Phrase'
import Match from '../../../shared/phrase/Match'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import Corpus from '../../../shared/Corpus'

import findPhraseExamples from './findPhraseExamples'
import { Component, createElement } from 'react'

interface Props {
    fact: Phrase
    corpus: Corpus
    knowledge: NaiveKnowledge
}

let React = { createElement: createElement }

export default function PhraseFactEntryComponent(props: Props) {
    return <dl>
        <dt>{ props.fact.description }</dt>
        <dd>{ props.fact.en }</dd>
    </dl>            
}
