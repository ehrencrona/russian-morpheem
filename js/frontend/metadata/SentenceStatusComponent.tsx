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
    status?: SentenceStatus,
    canAccept?: boolean
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
            this.setState({ status: status.status, canAccept: status.canAccept })
        })
    }

    accept() {
        if (!this.props.sentence.canAccept()) {
            return
        }

        this.props.corpus.sentenceHistory.setStatus(
            { status: STATUS_ACCEPTED },
            this.props.sentence.id
        )

        this.state.status.status = STATUS_ACCEPTED

        this.setState({ status: this.state.status })
    }

    resubmit() {
        this.state.status.status = STATUS_SUBMITTED

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

            { this.state.status.status == STATUS_SUBMITTED && this.state.canAccept && this.props.sentence.canAccept() ? 

                <div key='accept' className='button' onClick={ () => this.accept() }>Accept</div>

                :

                <div key='foo'>
                    {
                        (this.state.status.status != STATUS_SUBMITTED ?

                            <div key='resubmit' className='button' onClick={ () => this.resubmit() }>Resubmit</div>

                            :

                            <div key='none'/>)
                    }
                </div>
                
            }

        </div>)

    }

}