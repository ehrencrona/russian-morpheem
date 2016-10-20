
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
    matches: Match[]
}

let React = { createElement: createElement }
const SENTENCES_WANTED = 2

export default class PhraseFactEntryComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            matches: findPhraseExamples(props.fact, props.corpus, props.knowledge, SENTENCES_WANTED)
        }
    }

    render() {
        if (!this.state.matches.length) {
            return <dl><dt>{ this.props.fact.description }</dt><dd>&nbsp;</dd></dl>            
        }

        return <dl>
            { 
                this.state.matches.map(match =>
                     [
                        <dt key={ match.sentence.id }>{
                            match.words.map(w => w.word.toText()).join(' ') 
                        }</dt>,
                        <dd> {
                            match.pattern.getEnglishFragments().map(f => f.en(match, (word) => word.getEnglish())).join(' ') 
                        }</dd>
                     ]
                )
            }
        </dl>
    }
}
