

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
import { PhraseStatus, STATUS_OPEN, STATUS_CLOSED } from '../../shared/metadata/PhraseStatus'

interface Props {
    corpus: Corpus,
    phrase: Phrase
}

interface State {
    status?: PhraseStatus,
}

let React = { createElement: createElement }

export default class PhraseStatusComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    componentDidMount() {
        this.props.corpus.phraseHistory.getStatus(
            this.props.phrase.id
        )
        .then((status) => {
            this.setState({ status: status })
        })
    }

    close() {
        this.props.corpus.phraseHistory.setStatus(
            { status: STATUS_CLOSED },
            this.props.phrase.id
        )

        this.state.status.status = STATUS_CLOSED

        this.setState({ status: this.state.status })
    }

    open() {
        this.props.corpus.phraseHistory.setStatus(
            { status: STATUS_OPEN },
            this.props.phrase.id
        )

        this.state.status.status = STATUS_OPEN

        this.setState({ status: this.state.status })
    }

    render() {        
        if (!this.state.status) {
            return <div/>
        }

        let notes = this.state.status.notes

        return (<div>
            <div className='status'>
                <div className='current'>
                { this.state.status.status == STATUS_OPEN ? 

                    'Open' :

                    'Closed'

                }
                </div>

                { this.state.status.status == STATUS_OPEN ? 

                    <div key='close' className='button' onClick={ () => this.close() }>Close</div>

                    :

                    <div key='open' className='button' onClick={ () => this.open() }>Open</div>
                    
                }

            </div>
            <div className='field'>
                <div className='label'>
                    Notes
                </div>
                <textarea defaultValue={ notes } onBlur={ (e) => {
                    notes = (e.target as HTMLTextAreaElement).value

                    if (this.state.status.notes != notes) {
                        this.state.status.notes = notes

                        this.props.corpus.phraseHistory.setStatus({ notes: notes }, this.props.phrase.id)
                    }
                } } />
            </div>  
        </div>)

    }

}