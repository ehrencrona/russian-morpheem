/// <reference path="../../../typings/react/react.d.ts" />

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'
import PhraseMatch from '../../shared/phrase/PhraseMatch'

import toStudyWords from '../study/toStudyWords'
import StudyWord from '../study/StudyWord'
import StudyPhrase from '../study/StudyPhrase'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    phrase: Phrase
}

interface State {
}

let React = { createElement: createElement }

export default class PhraseStudyWordsComponent extends Component<Props, State> {
    render() {
        let phrase = this.props.phrase

        let exampleSentence: Sentence

        let words: StudyWord[] = []

        let sentence = this.props.corpus.sentences.sentences.find((sentence) => {
            return phrase.patterns[0].match(sentence.words, this.props.corpus.facts) != null 
        })

        let error: string 

        if (sentence) {
             words = toStudyWords(sentence, phrase, this.props.corpus);
        }
        else {
            error = 'No matching sentence.'
        }
console.log('study words', words)
        return <div className='phraseStudyWords'>
            <h3>Example</h3>
            {
                words.map((w) => 
                    
                    <span className={ w instanceof StudyPhrase ? 'match' : '' }> { 
                        (w instanceof StudyPhrase ? w.getHint() || w.jp : w.jp) }</span>

                )
            }
            {
                error ? 
                <div className='error'>{ error }</div> :
                <div/>
            }
        </div>

    }

}
