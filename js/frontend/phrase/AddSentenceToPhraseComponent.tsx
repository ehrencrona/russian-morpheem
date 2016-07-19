/// <reference path="../../../typings/react/react.d.ts" />

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Tab from '../OpenTab'
import PhraseMatch from '../../shared/phrase/PhraseMatch'
import Phrase from '../../shared/phrase/Phrase'
import Sentence from '../../shared/Sentence'
import MatchingSentencesComponent from './MatchingSentencesComponent'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    phrase: Phrase,
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

export default class FindPhraseComponent extends Component<Props, State> {

    addSentence(sentence: Sentence) {
        this.props.corpus.sentences.addPhrase(this.props.phrase, sentence)
    }

    addAll() {
        let phrase = this.props.phrase
        let sentences = this.props.corpus.sentences

        sentences.sentences.forEach((sentence) => {
            if (phrase.patterns[0].match(sentence.words, this.props.corpus.facts) &&
                !sentence.hasPhrase(this.props.phrase)) {
                sentences.addPhrase(phrase, sentence)
            }
        })
    }

    render() {
        return <div>
            <div className='buttonBar'>                
                <div className='button' 
                    onClick={ () => { 
                        this.addAll(); 
                        (this.refs['sentences'] as Component<any, any>).forceUpdate() 
                    }}>
                    Add all
                </div>
            </div>
            <MatchingSentencesComponent 
                corpus={ this.props.corpus }
                match={ this.props.phrase.patterns[0] }
                tab={ this.props.tab }
                filter={ (sentence) => !sentence.hasPhrase(this.props.phrase) }
                ref='sentences'
                buttonFactory={ (sentence) => 
                    <div className='button' onClick={ 
                        () => { 
                            this.addSentence(sentence);
                            (this.refs['sentences'] as Component<any, any>).forceUpdate() 
                    } } >Add</div>
                }
            />
            </div>
    }
}
