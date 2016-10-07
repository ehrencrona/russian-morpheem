
/// <reference path="../../../typings/human-time.d.ts" />
/// <reference path="../../../typings/marked.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import { AUTHOR_ME } from '../../frontend/metadata/FrontendSentenceHistory'
import Sentence from '../../shared/Sentence'
import { Event } from '../../shared/metadata/Event'
import human = require('human-time')
import marked = require('marked')

interface Props {
    corpus: Corpus,
    sentence: Sentence,
    commentBoxOpen?: boolean
}

interface State {
    events?: Event[],
    commentOpen?: boolean
}

let React = { createElement: createElement }

export default class SentenceHistoryComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            commentOpen: props.commentBoxOpen
        }
    }

    componentDidMount() {
        this.loadEvents()
    }

    loadEvents() {
        this.props.corpus.sentenceHistory.getEventsForSentence(this.props.sentence.id)
        .then((events: Event[]) => this.setState({ events: events.reverse() }))
    }

    componentDidUpdate() {
        if (this.state.commentOpen) {
            (this.refs['commentTextField'] as HTMLTextAreaElement).focus()
        }
    }

    addComment() {
        let textField = this.refs['commentTextField'] as HTMLTextAreaElement
        let history = this.props.corpus.sentenceHistory

        history.recordComment(textField.value, this.props.sentence, AUTHOR_ME)
            .then(() => {
                this.loadEvents()

                textField.value = ''

                this.setState({ commentOpen: false })
            })
    }

    render() {
        return (<div>
            <h3>History</h3>

            {
                this.state.commentOpen ?

                    <form className='comment' onSubmit={ (e) => { this.addComment(); e.preventDefault() }}>
                        <textarea rows={3} wrap='true' ref='commentTextField'/>
                        <div className='buttonBar'>
                            <input type='submit' value='Post' className='button'/>
                            <div className='button' onClick={() => this.setState({commentOpen: false}) }>Cancel</div>
                        </div>
                    </form>

                    :

                    <div className='buttonBar'>
                        <div className='button' onClick={() => this.setState({commentOpen: true}) }>Comment</div>
                    </div>
            }

            <ul className='history'>
            { (this.state.events || []).map((event: Event) => {

                return <li key={ event._id }>
                    <div className='main'>
                        <div className='event'>{event.event}</div>
                        <div className='text'>
                            <div className='date'>{ human(event.date) }, {event.author || 'unknown'}</div> 
                            {
                                event.event == 'comment' ?
                                <div dangerouslySetInnerHTML={ { __html: marked(event.text)} }/>
                                :
                                event.text
                            }
                        </div>
                    </div>
                </li>

            }) }
            </ul>
        </div>)

    }

}