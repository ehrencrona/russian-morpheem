/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'

interface Props {
    corpus: Corpus,
    sentence: Sentence
}

interface State {
    events?: Event[]
}

let React = { createElement: createElement }

export default class SentenceHistoryComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    componentDidMount() {
        this.props.corpus.sentenceHistory.getEvents(this.props.sentence.id)
        .then((events: Event[]) => this.setState({ events: events }))
    }

    render() {
        
        return (<ul>
        { (this.state.events || []).map((event: Event) => {

            return <li>{ event.date }: {event.author} wrote "{ event.text }"</li>

        }) }
        </ul>)

    }

}