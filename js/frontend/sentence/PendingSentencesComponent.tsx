/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Tab from '../Tab'
import SentenceComponent from '../SentenceComponent'

import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
    sentenceIds?: number[]
}

let React = { createElement: createElement }

export default class PendingSentencesComponent extends Component<Props, State> {
    componentDidMount() {
        this.props.corpus.sentenceHistory.getPendingSentences()
        .then((pending) => {
            this.setState({ sentenceIds: pending })
        })
    }

    accept(sentenceId: number) {
        this.props.corpus.sentenceHistory.setStatus(
            { status: STATUS_ACCEPTED },
            sentenceId
        )

        this.setState({ sentenceIds: this.state.sentenceIds.filter((id) => id != sentenceId) })
    }

    openSentence(sentence: Sentence) {
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
    }

    render() {        
        if (!this.state || !this.state.sentenceIds) {
            return <div/>
        }

        let sentences = this.state.sentenceIds.map((id) =>
            this.props.corpus.sentences.get(id)
        ).filter((s) => !!s)

        return (<div>
            <ul className='pending'>

                { sentences.map((sentence) => 

                    <li key={ sentence.id }>
                        { 
                            sentence.canAccept() ? 
                                <div className='button' onClick={ () => this.accept(sentence.id) }>Accept</div>
                                :
                                <div className='unacceptable'>Not ready</div>
                        }
                        <div className='clickable' onClick={ () => this.openSentence(sentence) } >{ 
                            sentence.toUnambiguousString(this.props.corpus.words) 
                        }</div>

                    </li>

                ) }

            </ul>
            
        </div>)

    }

}