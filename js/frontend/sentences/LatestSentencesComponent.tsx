/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Tab from '../Tab'
import SentenceComponent from '../SentenceComponent'

import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

interface Props {
    corpus: Corpus,
    tab: Tab,
    my: boolean
}

interface State {
    sentenceIds?: number[]
}

let React = { createElement: createElement }

export default class LatestSentencesComponent extends Component<Props, State> {
    componentDidMount() {
        (this.props.my ?
            this.props.corpus.sentenceHistory.getMyLatestSentences()
            :
            this.props.corpus.sentenceHistory.getLatestSentences())
        .then((latest) => {
            this.setState({ sentenceIds: latest })
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
        if (!this.state || !this.state.sentenceIds) {
            return <div/>
        }

        let sentences = this.state.sentenceIds.map((id) => {
            try {
                return this.props.corpus.sentences.get(id)
            } 
            catch (e) {
                console.error(e)
                return null
            }
        }).filter((s) => !!s)

        return (<div>
            <ul className='pending'>

                { sentences.map((sentence) => 

                    <li key={ sentence.id }>

                        <div className='clickable' onClick={ () => this.openSentence(sentence) } >{ 
                            sentence.toUnambiguousString(this.props.corpus.words) 
                        }
                        </div>

                    </li>

                ) }

            </ul>
            
        </div>)
    }

}