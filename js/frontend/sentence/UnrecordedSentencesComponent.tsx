import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Tab from '../OpenTab'
import SentenceComponent from '../SentenceComponent'
import openSentence from '../sentence/openSentence'
import recorder from '../Recorder'

import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
    recording?: boolean,
    sentence?: Sentence,
    sentenceIds?: number[]
}

let React = { createElement: createElement }

export default class UnrecordedSentencesComponent extends Component<Props, State> {
    componentDidMount() {
        recorder.init()

        this.props.corpus.sentenceHistory.getUnrecordedSentences()
        .then((unrecorded) => {
            this.setState({ 
                sentence: this.props.corpus.sentences.get(unrecorded[0]),
                sentenceIds: unrecorded })
        })
    }

    record(sentenceId: number) {
        setTimeout(() => {
            recorder.startRecording(this.state.sentence.id, 'foobar')
            this.setState({ recording: true })
        }, 200)
    }

    play(sentenceId: number) {
        let audioUrl = '/public-api/ru/sentence/' + sentenceId + '/audio.wav?cachebuster=' + Math.random()

        new Audio(audioUrl).play()
    }

    next() {
        this.setState({ 
            sentenceIds: this.state.sentenceIds.filter((id) => id != this.state.sentence.id),
            sentence: this.props.corpus.sentences.get(this.state.sentenceIds.find((id) => id != this.state.sentence.id)) 
        })
    }

    endRecording() {
        recorder.stopRecording()
            .then((url) => {
                this.setState({ recording: false })
            })
    }

    neverEmpty(str: string) {
        if (!str.trim()) {
            return '<Empty sentence>'
        }
        else {
            return str
        }
    }

    render() {        
        if (!this.state || !this.state.sentenceIds) {
            return <div/>
        }

        let sentences = this.state.sentenceIds.map((id) =>
            this.props.corpus.sentences.get(id)
        ).filter((s) => !!s)

        return (<div>
            <p><b>{ this.state.sentence.toString() } ({ this.state.sentence.id })</b></p>

            <div className='buttonBar'>

            { 
                this.state.recording ?
                    <div className='button' onClick={ () => this.endRecording() }>Stop</div>
                    :
                    <div className='button' onClick={ () => this.record(this.state.sentence.id) }>Record</div>
            }

                <div className='button' onClick={ () => this.play(this.state.sentence.id) }>Play</div>
                <div className='button' onClick={ () => this.next() }>Next</div>

            </div>

            <ul className='pending'>
                { sentences.map((sentence) => 

                    <li key={ sentence.id }>
                        <div className='clickable' onClick={ () => openSentence(sentence, this.props.corpus, this.props.tab) } >{ 
                            this.neverEmpty(sentence.toUnambiguousString(this.props.corpus.words)) 
                        }</div>

                    </li>

                ) }

            </ul>
            
        </div>)

    }

}