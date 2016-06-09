/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

interface Props {
    corpus: Corpus,
    sentence: Sentence
}

interface State {
    status?: SentenceStatus
}

let React = { createElement: createElement }

export default class SentenceStatusComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    componentDidMount() {
        this.props.corpus.sentenceHistory.getStatus(
            this.props.sentence.id
        )
        .then((status) => {
            this.setState({ status: status })
        })
    }

    accept() {
        this.props.corpus.sentenceHistory.setStatus(
            STATUS_ACCEPTED,
            this.props.sentence.id
        )

        this.state.status.status = STATUS_ACCEPTED

        this.setState({ status: this.state.status })
    }

    render() {
        
        if (!this.state.status) {
            return <div/>
        }

        return (<div className='status'>

            <div className='current'>
            { this.state.status.status == STATUS_SUBMITTED ? 

                'Verification pending' :

                'Accepted'

            }
            </div>

            { this.state.status.status == STATUS_SUBMITTED ? 

                <div className='button' onClick={ () => this.accept() }>Accept</div>

                :

                <div/>
            }

        </div>)

    }

}