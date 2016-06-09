/// <reference path="../../../typings/react/react.d.ts" />
/// <reference path="../../../typings/human-time.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'
import human = require('human-time')

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
        if (!this.state.events || !this.state.events.length) {
            return <div/>
        } 

        return (<div>
            <h3>History</h3>
            <ul className='history'>
            { (this.state.events || []).map((event: Event) => {

                return <li key={ event._id }>
                    <div className='date'>{ human(event.date) }, {event.author || 'unknown'}</div> 
                    <div className='main'>
                        <span className='event'>{event.event}</span>
                        <span className='text'>{event.text}</span>
                    </div>
                </li>

            }) }
            </ul>
        </div>)

    }

}