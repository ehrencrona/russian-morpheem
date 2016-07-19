/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'
import Tab from '../OpenTab'
import openSentence from './openSentence'

import human = require('human-time')
import marked = require('marked')

interface Props {
    corpus: Corpus,
    events: Event[],
    tab: Tab
}

interface State {
}

interface EventAndSentence {
    event: Event,
    sentence: Sentence
}

let React = { createElement: createElement }

export default class EventsComponent extends Component<Props, State> {
    renderEventAndSentence(eventAndSentence: EventAndSentence) {
        let html

        if (eventAndSentence.event.event == 'comment' || !eventAndSentence.sentence) {
            html = marked(eventAndSentence.event.text)
        }
        else {
            html = eventAndSentence.event.text
        }

        if (!html.trim()) {
            html = '&lt;Empty sentence&gt;'
        }

        return <li key={ eventAndSentence.event._id }>
            <div className='main'>
                <div className='event'>{ eventAndSentence.event.event }</div>
                <div className='text'>
                    <div className='date'>
                        { human(new Date(eventAndSentence.event.date.toString())) },&nbsp;
                        { eventAndSentence.event.author || 'Unknown' }
                    </div>
                    { (eventAndSentence.sentence ? 
                        <div className='clickable' onClick={ () => openSentence(eventAndSentence.sentence, this.props.corpus, this.props.tab) } >
                            <div dangerouslySetInnerHTML={ { __html: html } }/>
                        </div>
                        :
                        <div dangerouslySetInnerHTML={ { __html: html } }/>
                    )}
                </div>
            </div>
        </li>
    } 

    render() {        
        let eventAndSentences = this.props.events.map((event) => {
            return {
                sentence: this.props.corpus.sentences.get(event.sentence),
                event: event
            }
        })

        return (
            <ul className='history'>
                { eventAndSentences.map((eas) => this.renderEventAndSentence(eas)) }
            </ul>)
    }
}