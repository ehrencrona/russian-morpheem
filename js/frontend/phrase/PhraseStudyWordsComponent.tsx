/// <reference path="../../../typings/react/react.d.ts" />

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'
import PhrasePattern from '../../shared/phrase/PhrasePattern'

import toStudyWords from '../study/toStudyWords'
import StudyWord from '../study/StudyWord'
import StudyPhrase from '../study/StudyPhrase'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus
    phrase: Phrase
    pattern: PhrasePattern
}

interface State {
}

let React = { createElement: createElement }

export default class PhraseStudyWordsComponent extends Component<Props, State> {
    render() {

        let phrase = this.props.phrase
        let pattern: PhrasePattern = this.props.pattern

        let words: StudyWord[] = []
        let sentence: Sentence

        if (phrase.patterns.length) {
            sentence = this.props.corpus.sentences.sentences.find((sentence) => {
                return !!sentence.phrases.find((p) => p.getId() == phrase.getId() && 
                    pattern.match(sentence.words, this.props.corpus.facts) != null)
            })

            if (!sentence) {
                sentence = this.props.corpus.sentences.sentences.find((sentence) => {
                    return pattern.match(sentence.words, this.props.corpus.facts) != null 
                })
            }
        }

        let error: string 

        if (sentence) {
             words = toStudyWords(sentence, phrase, this.props.corpus);
        }
        else {
            error = 'No matching sentence.'
        }

        return <div className='phraseStudyWords'>
            <div className='field'>
                <div className='label'>
                    Pattern
                </div>
                {
                    words.map((w) => 
                        
                        <span className={ w instanceof StudyPhrase ? 'match' : '' }> { 
                            (w instanceof StudyPhrase ? w.getHint() || '___' : w.jp) }</span>

                    )
                }
                {
                    error ? 
                    <div className='error'>{ error }</div> :
                    <div/>
                }
            </div>
        </div>
    }
}
