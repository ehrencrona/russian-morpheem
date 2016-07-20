/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import { findSentencesForFact } from '../shared/SentencesByFactIndex'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Fact,
    onDelete?: () => void
}

interface State {}

let React = { createElement: createElement }

export default class DeleteFactButtonComponent extends Component<Props, State> {
    delete() {
        if (findSentencesForFact(this.props.fact, this.props.corpus.sentences, this.props.corpus.facts, 0).count > 0) {
            alert('There are sentences using this fact.')

            return
        }

        this.props.corpus.facts.remove(this.props.fact)

        if (this.props.onDelete) {
            this.props.onDelete()
        }
    }

    render() {
        return <div>
            <div className='button' onClick={ () => { this.delete() }}>Delete</div>
        </div>;
    }
}
