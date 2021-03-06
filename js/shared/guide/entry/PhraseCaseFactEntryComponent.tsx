
import Phrase from '../../../shared/phrase/Phrase'
import Match from '../../../shared/phrase/Match'
import PhraseCase from '../../../shared/phrase/PhraseCase'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import Corpus from '../../../shared/Corpus'

import findPhraseExamples from './findPhraseExamples'
import { Component, createElement } from 'react'
import { FORMS, CASES } from '../../../shared/inflection/InflectionForms'

interface Props {
    fact: PhraseCase
    corpus: Corpus
    knowledge: NaiveKnowledge
}

interface State {
    matches: Match[]
}

let React = { createElement: createElement }
const SENTENCES_WANTED = 2

export default class PhraseCaseFactEntryComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        let phrase: Phrase = props.fact.phrase

        this.state = {
            matches: findPhraseExamples(phrase, props.corpus, props.knowledge, SENTENCES_WANTED)
        }
    }

    render() {
        return <dl>
            <dt>{ 
                this.state.matches.map(match =>
                    <div key={ match.sentence.id }>{
                        match.words.map(w => w.word.toText()).join(' ') 
                    }</div>
                )
            }</dt>
            <dd>using the {
                FORMS[CASES[this.props.fact.grammaticalCase]].name
            }</dd>
        </dl>
    }
}
