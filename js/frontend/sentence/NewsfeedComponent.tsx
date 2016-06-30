/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'
import Tab from '../Tab'
import EventsComponent from './EventsComponent'

interface Props {
    corpus: Corpus,
    tab: Tab,
}

interface State {
    events?: Event[],
}

let React = { createElement: createElement }

export default class NewsfeedComponent extends Component<Props, State> {
    componentDidMount() {
        this.load()
    }

    load() {
        this.props.corpus.sentenceHistory.getNewsfeed()
        .then((latest) => {
            this.setState({ events: latest })
        })
    }

    render() {
        if (this.state && this.state.events) {
            return <EventsComponent 
                corpus={ this.props.corpus } 
                events={ this.state.events } 
                tab={ this.props.tab } />
        }
        else {
            return <div/>
        }
    }

}