/// <reference path="../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../shared/Corpus'
import Sentence from '../shared/Sentence'
import Sentences from '../shared/Sentences'
import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../shared/metadata/SentenceStatus'

interface Props {
    corpus: Corpus,
    sentence: Sentence
}

interface State {
}

let React = { createElement: createElement }

export default class SentenceTranslationComponent extends Component<Props, State> {

    save(english: string) {
        let sentence = this.props.sentence

        if (english != sentence.english) {
            sentence.setEnglish(english.trim())
            this.props.corpus.sentences.store(sentence)
        }
    }

    render() {
        return <div className='sentenceTranslation'>
            <h3>English</h3>

            <input type='text' lang='en' autoCapitalize='off' defaultValue={ this.props.sentence.english } 
                onBlur={ (e) => this.save((e.target as HTMLInputElement).value) }/> 
        </div>        
    }

}