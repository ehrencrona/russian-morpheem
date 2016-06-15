/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'
import Tab from '../Tab'
import SentenceComponent from '../SentenceComponent'
import { getAllAuthors } from '../../backend/getAuthor'
import human = require('human-time')

import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

interface Props {
    corpus: Corpus,
    tab: Tab,
    my: boolean
}

interface State {
    events?: Event[],
    eventType?: string,
    author?: string
}

interface EventAndSentence {
    event: Event,
    sentence: Sentence
}

const AUTHOR_ALL = 'all'
const EVENT_TYPE_CREATE = 'create'
const EVENT_TYPE_ALL = 'all'

let React = { createElement: createElement }

export default class LatestEventsComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
        this.state = {
            author: AUTHOR_ALL,
            eventType: EVENT_TYPE_CREATE
        }
    }

    componentDidMount() {
        this.load(
            this.state && this.state.author,
            this.state && this.state.eventType)
    }

    load(author: string, eventType: string) {
        this.setState({ author: author, eventType: eventType });

        (this.props.my ?
            this.props.corpus.sentenceHistory.getMyLatestEvents(
                eventType)
            :
            this.props.corpus.sentenceHistory.getLatestEvents(
                author, 
                eventType))
        .then((latest) => {
            this.setState({ events: latest })
        })
    }

    openSentence(sentence: Sentence) {
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
    }

    render() {        
        if (!this.state || !this.state.events) {
            return <div/>
        }

        let eventAndSentences = this.state.events.map((event) => {
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

        let buttonForAuthor = (author) =>
            <div className={ 'tag ' + (this.state.author == author ? ' selected' : '') }
                key={ author }
                onClick={ () => { 
                    this.load(author, this.state.eventType)
                }}>{ author }</div>

        let buttonForEventType = (eventType) =>
            <div className={ 'button ' + (this.state.eventType == eventType ? ' selected' : '') }
                key={ eventType }
                onClick={ () => { 
                    this.load(this.state.author, eventType)
                }}>{ eventType == EVENT_TYPE_CREATE ? 'Sentences' : 'Events' }</div>

        return (<div>
            <div className='buttonBar'>
            {
                [ EVENT_TYPE_ALL, EVENT_TYPE_CREATE ].map(buttonForEventType)
            }
            </div>

            { !this.props.my ?
                <div className='tagFilter'>
                {
                    [ AUTHOR_ALL ].concat(getAllAuthors()).map(buttonForAuthor)
                }
                </div>
                :
                <div/>
            }

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
                                <div className='clickable' onClick={ () => this.openSentence(eventAndSentence.sentence) } >{ 
                                    eventAndSentence.sentence.toUnambiguousString(this.props.corpus.words) 
                                }
                                </div>
                            </div>
                        </div>
                    </li>

                ) }

            </ul>
            
        </div>)
    }

}