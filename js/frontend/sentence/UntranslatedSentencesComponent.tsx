

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Tab from '../OpenTab'
import SentenceComponent from './SentenceComponent'
import openSentence from '../sentence/openSentence'
import googleTranslate from './googleTranslate'

import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
    sentence: Sentence
}

let React = { createElement: createElement }

function untranslated(sentence: Sentence) {
    return !sentence.english || !sentence.english.trim()
}

export default class UntranslatedSentencesComponent extends Component<Props, State> {
    constructor(props) {
        super(props) 

        this.state = { sentence: null }
    }

    translate(english: string) {
        if (!english) {
            return
        }

        let sentence = this.state.sentence

        if (english != sentence.english) {
            sentence.english = english.trim()
            this.props.corpus.sentences.store(sentence)
        }

        this.next()
    }

    next() {
        let nextSentence = this.props.corpus.sentences.sentences.find(untranslated)

        googleTranslate(nextSentence.toString())
        .then((translation) => {
            this.setState({ sentence: nextSentence });

            (this.refs['input'] as HTMLInputElement).value = translation
        })
    }

    componentDidMount() {
        this.next()
    }

    render() {
        let sentences: Sentence[] = this.props.corpus.sentences.sentences.filter(untranslated)

        return (<div>
            <ul className='untranslated'>

                { (this.state.sentence ?

                    <div>
                        <p><b>{ this.state.sentence.toString() }</b></p>

                        <input type='text' defaultValue={ this.state.sentence.english || '' } ref='input'                 
                            onKeyPress={ (event) => {                    
                            if (event.charCode == 13) {
                                this.translate((event.target as HTMLInputElement).value) 
                            }}
                        }/>

                        <div className='buttonBar'>
                            <div className='button' onClick={ () => openSentence(this.state.sentence, this.props.corpus, this.props.tab) }>Open</div>
                            <div className='button' onClick={ () => this.translate( (this.refs['input'] as HTMLInputElement).value ) }>Save</div>
                        </div>
                    </div>

                    :

                    <div/>
                )}

                <p><b>{ sentences.length }</b> untranslated sentences</p>

                { sentences.slice(0, 100).map((sentence) => 

                    <li key={ sentence.id }>
                        <div className='clickable' onClick={ () => openSentence(sentence, this.props.corpus, this.props.tab) } >{ 
                            sentence.toUnambiguousString(this.props.corpus.words) 
                        }</div>
                    </li>

                ) }

            </ul>

        </div>)

    }

}