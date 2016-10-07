

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Tab from '../OpenTab'
import PhrasePattern from '../../shared/phrase/PhrasePattern'
import Phrase from '../../shared/phrase/Phrase'
import Sentence from '../../shared/Sentence'
import PhraseSentencesComponent from './PhraseSentencesComponent'
import isConflictFunction from './isConflict'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    phrase: Phrase,
    tab: Tab
}

interface State {
    includeConflicts: boolean
}

let React = { createElement: createElement }

export default class FindPhraseComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            includeConflicts: false
        }
    }

    addSentence(sentence: Sentence) {
        this.props.corpus.sentences.addPhrase(this.props.phrase, sentence)
    }

    addAll() {
        let phrase = this.props.phrase
        let sentences = this.props.corpus.sentences

        sentences.sentences.forEach((sentence) => {
            if (phrase.patterns[0].match({ sentence: sentence, words: sentence.words, facts: this.props.corpus.facts }) &&
                !sentence.hasPhrase(this.props.phrase)) {
                sentences.addPhrase(phrase, sentence)
            }
        })
    }

    render() {
        let phrase = this.props.phrase
        let facts = this.props.corpus.facts

        return <div>
            <div className='buttonBar'>                
                <div className='button' 
                    onClick={ () => { 
                        this.addAll(); 
                        (this.refs['sentences'] as Component<any, any>).forceUpdate() 
                    }}>
                    Add all
                </div>
                <div>

                    <input type='checkbox' defaultValue={ this.state.includeConflicts.toString() } 
                        onChange={ (e) => {
                            this.setState({ includeConflicts: (e.target as HTMLInputElement).checked })
                        } } 
                        id='includeConflicts'/> 
                    <label htmlFor='includeConflicts'>Include matches already part of another phrase</label> 

                </div>
            </div>
            <PhraseSentencesComponent 
                corpus={ this.props.corpus }
                patterns={ phrase.patterns }
                isConflict={ isConflictFunction(phrase, this.props.corpus.facts) }
                includeConflicts={ this.state.includeConflicts }
                tab={ this.props.tab }
                filter={ (sentence) => !sentence.hasPhrase(phrase) }
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
