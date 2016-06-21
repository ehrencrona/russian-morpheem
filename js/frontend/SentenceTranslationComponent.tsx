/// <reference path="../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../shared/Corpus'
import Sentence from '../shared/Sentence'
import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../shared/metadata/SentenceStatus'

interface Props {
    corpus: Corpus,
    sentence: Sentence
}

interface State {
}

let React = { createElement: createElement }

export default class SentenceTranslationComponent extends Component<Props, State> {

    render() {
        return <div>
            <h3>English</h3>
            { this.props.sentence.english }
        </div>        
    }

}