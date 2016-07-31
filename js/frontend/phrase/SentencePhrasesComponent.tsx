/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Phrase from '../../shared/phrase/Phrase'
import PhraseCase from '../../shared/phrase/PhraseCase'
import { SentenceStatus, STATUS_ACCEPTED, STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'
import PhraseFactComponent from './PhraseFactComponent'
import Tab from '../OpenTab'
import StudyPhrase from '../study/StudyPhrase'
import toStudyWords from '../study/toStudyWords'

interface Props {
    corpus: Corpus
    sentence: Sentence
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

export default class SentenceStatusComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    openPhrase(phrase) {
        this.props.tab.openTab(
            <PhraseFactComponent fact={ phrase } corpus={ this.props.corpus } tab={ this.props.tab }/>,
            phrase.toString(),
            phrase.id.toString()
        )
    }

    addPhrase(phrase) {
        this.props.corpus.sentences.addPhrase(phrase, this.props.sentence)
        this.forceUpdate()
    }

    removePhrase(phrase) {
        this.props.corpus.sentences.removePhrase(phrase, this.props.sentence)
        this.forceUpdate()
    }

    renderSentenceExtract(phrase: Phrase) {
        let words = this.props.sentence.words

        let match = phrase.match(words, this.props.corpus.facts)

        if (!match) {
            return <div classname='error'>Does not fit pattern</div>
        }
        else {
            return <div className='match'>{
                match.words.map((wordIndex) => words[wordIndex.index].jp).join(' ')
            }</div>
        }
    }

    renderStudyWords(phrase: Phrase) {
        return <div>
            <div className='match'>{ 
                toStudyWords(this.props.sentence, phrase, this.props.corpus, true)
                    .filter((w) => w instanceof StudyPhrase || !!w.facts.find((f) => f.fact instanceof PhraseCase))
                    .map((w) => (w instanceof StudyPhrase ? w.getHint() || '___' : w.jp)).join(' ') 
            }</div>
            <div className='phrase'>{ 
                phrase.description 
            }</div>
        </div>
    }

    render() {
        let corpus = this.props.corpus
        let sentence = this.props.sentence

        let potentialPhrases = corpus.phrases.all().filter((p) =>
            !!p.match(sentence.words, corpus.facts) && !sentence.hasPhrase(p)
        )

        let renderPhrase = (p) => 
            <div className='clickable' onClick={() => this.openPhrase(p) }>
                { this.renderStudyWords(p) }</div>

        return <div className='sentenceFacts'>
            <div className='current'>
                <h4>Added</h4>
                <ul>

                    {

                        this.props.sentence.phrases.map((p) => 
                            <li key={ p.id }>
                                <div className='clickable button' onClick={ () => this.removePhrase(p) }>Remove</div>
                                { renderPhrase(p) }
                            </li>
                        )

                    }

                </ul>
            </div>

            <div className='matching'>
                <h4>Matching</h4>

                <ul>

                    {

                        potentialPhrases.map((p) => 
                            <li>
                                <div className='clickable button' onClick={ () => this.addPhrase(p) } >Add</div>
                                { renderPhrase(p) }
                            </li>
                        )

                    }

                </ul>
            </div>
        </div>

    }

}