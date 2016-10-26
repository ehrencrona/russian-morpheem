
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

interface State {
}

let React = { createElement: createElement }
const SENTENCES_WANTED = 2

export default class PhraseFactEntryComponent extends Component<Props, State> {
    render() {
        return <dl>
            <dt>{ this.props.fact.description }</dt>
            <dd>{ this.props.fact.en }</dd>
        </dl>            
    }
}
