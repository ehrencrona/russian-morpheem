/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'
import Tab from '../Tab'
import EventsComponent from './EventsComponent'
import { getAllAuthors } from '../../backend/getAuthor'
import { AUTHOR_ME } from '../../frontend/metadata/FrontendSentenceHistory'

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
            this.props.corpus.sentenceHistory.getLatestEvents(
                AUTHOR_ME,
                eventType)
            :
            this.props.corpus.sentenceHistory.getLatestEvents(
                author, 
                eventType))
        .then((latest) => {
            this.setState({ events: latest })
        })
    }

    render() {        
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

            { this.state && this.state.events ?
                <EventsComponent 
                    corpus={ this.props.corpus } 
                    events={ this.state.events } 
                    tab={ this.props.tab } />
                :
                <div/>
            }
        </div>)
    }

}