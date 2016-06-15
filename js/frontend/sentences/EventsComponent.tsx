/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'
import Tab from '../Tab'
import SentenceComponent from '../SentenceComponent'

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
    openSentence(sentence: Sentence) {
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
    }

    render() {        
        let eventAndSentences = this.props.events.map((event) => {
            try {
                return {
                    sentence: this.props.corpus.sentences.get(event.sentence),
                    event: event
                }
            } 
            catch (e) {
                console.error(e)
                return null
            }
        }).filter((s) => !!s)

        return (
            <ul className='history'>
                { eventAndSentences.map((eventAndSentence) => 

                    <li key={ eventAndSentence.event._id }>
                        <div className='main'>
                            <div className='event'>{ eventAndSentence.event.event }</div>
                            <div className='text'>
                                <div className='date'>
                                    { human(new Date(eventAndSentence.event.date.toString())) },&nbsp;
                                    { eventAndSentence.event.author || 'Unknown' }
                                </div>
                                <div className='clickable' onClick={ () => this.openSentence(eventAndSentence.sentence) } >
                                { 
                                    eventAndSentence.event.event == 'comment' ?
                                        <div dangerouslySetInnerHTML={ { __html: marked(eventAndSentence.event.text)} }/>
                                    :
                                        eventAndSentence.sentence.toUnambiguousString(this.props.corpus.words)

                                }
                                </div>
                            </div>
                        </div>
                    </li>

                ) }
            </ul>)
    }
}