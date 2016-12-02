

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'
import PhrasePattern from '../../shared/phrase/PhrasePattern'
import PhraseMatch from '../../shared/phrase/PhraseMatch'
import ExactWordMatch from '../../shared/phrase/ExactWordMatch'
import PhraseStudyWordsComponent from './PhraseStudyWordsComponent'
import Tab from '../OpenTab'
import openFact from '../fact/openFact'

import { MISSING_INDEX } from '../../shared/fact/Facts'
import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus
    phrase: Phrase
    onChange: () => void
    tab: Tab
}

interface State {
    error?: string,
    sentencesByPhrase?: {
        [ key: number]: Sentence[]
    }
}

let React = { createElement: createElement }

export default class PhrasePatternComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            sentencesByPhrase: this.findSentencesByPhrase()
        }
    }

    changeDescription(newDescription: string) {
        this.props.corpus.phrases.setDescription(this.props.phrase, newDescription)
    }

    changePhraseEnglish(newEnglish: string) {
        this.props.corpus.phrases.setPhraseEnglish(this.props.phrase, newEnglish)
    }

    changePatternEnglish(english: string, pattern: PhrasePattern, index: number) {
        if (english == pattern.en) {
            return
        }

        this.props.corpus.phrases.setPatternEnglish(this.props.phrase, pattern, english);

        (this.refs['studyWords' + index] as PhraseStudyWordsComponent).forceUpdate() 
    }

    findSentencesByPhrase() {
        let sentencesByPhrase: { [ key: number]: Sentence[] } = {}
        let start = new Date()
        let props = this.props
        let corpus = props.corpus
        let phrase = props.phrase

        corpus.sentences.sentences.find(sentence => {
            if (!phrase.isAutomaticallyAssigned() &&
                !sentence.phrases.find((p) => p.getId() == phrase.getId())) {
                return
            }

            let match = corpus.sentences.match(sentence, phrase, corpus.facts) 
            
            if (match) {
                let sentences = sentencesByPhrase[match.pattern.key]

                if (!sentences) {
                    sentences = []
                    sentencesByPhrase[match.pattern.key] = sentences
                }  

                sentences.push(sentence)
            }

            if (new Date().getTime() - start.getTime() > 500) {
                console.log('Timeout matching sentences for ' + props.phrase.id)

                return true
            }
        })

        return sentencesByPhrase
    }

    changePattern(patternStr: string, oldPattern: PhrasePattern) {
        let props = this.props
        let corpus = props.corpus

        try {
            let newPattern = PhrasePattern.fromString(patternStr.trim(), oldPattern.en,
                corpus.words, corpus.inflections)

            if (newPattern.toString() == oldPattern.toString()) {
                this.setState({ 
                    error: null,
                })

                return
            }

            let patterns = props.phrase.patterns.map((p) => 
                (p == oldPattern ? newPattern : p))

            corpus.phrases.setPattern(props.phrase, patterns)

            this.setState({ 
                error: null,
                sentencesByPhrase: this.findSentencesByPhrase()
            })

            props.onChange();

            return newPattern
        }
        catch (e) {
            this.setState({ error: e.toString() })
        }
    }

    deletePattern(pattern: PhrasePattern) {
        let props = this.props

        props.phrase.patterns = props.phrase.patterns.filter(p => p != pattern)
        props.corpus.phrases.store(props.phrase)

        this.forceUpdate()
    }

    movePattern(pattern: PhrasePattern, offset: number) {
        let phrase = this.props.phrase

        let i = phrase.patterns.indexOf(pattern)

        phrase.patterns.splice(i, 1)
        phrase.patterns.splice(i+offset, 0, pattern)

        this.props.corpus.phrases.store(phrase)

        this.forceUpdate()
    }

    addPattern() {
        this.props.phrase.patterns.push(
            new PhrasePattern([], '')
        )

        this.forceUpdate()
    }

    render() {
        let phrase = this.props.phrase

        return <div className='pattern'>

            { this.state.error ? 
                <div className='error'>{ this.state.error }</div>    
                :
                <div/>
            }

            <div className='field'>
                <div className='label'>
                    Name (Russian)
                </div>
            
                <input type='text' lang={ this.props.corpus.lang } autoCapitalize='off' defaultValue={ phrase.description } 
                    onBlur={ (e) => this.changeDescription((e.target as HTMLInputElement).value) }/>
            </div>

            <div className='field'>
                <div className='label'>
                    Name (English)
                </div>
            
                <input type='text' lang={ this.props.corpus.lang } autoCapitalize='off' defaultValue={ phrase.en } 
                    onBlur={ (e) => this.changePhraseEnglish((e.target as HTMLInputElement).value) }/>
            </div>

            {  
                phrase.patterns.map((pattern, index) => 

                    <div key={ pattern.key } className='pattern'>
                        <h3>Pattern</h3>

                        <div className='field'>
                            <div className='label'>
                                English
                            </div>
                        
                            <input type='text' lang='en' autoCapitalize='off' defaultValue={ pattern.en } 
                                onBlur={ (e) => this.changePatternEnglish((e.target as HTMLInputElement).value, pattern, index) }/>
                        </div>

                        <div className='field'>
                            <div className='label'>
                                Pattern
                            </div>
                        
                            <input type='text' lang={ this.props.corpus.lang } autoCapitalize='off' 
                                defaultValue={ pattern && pattern.toString() } 
                                onBlur={ (e) => {
                                    let input = e.target as HTMLInputElement
                                    
                                    let newPattern = this.changePattern(input.value, pattern)

                                    if (newPattern) {
                                        input.value = newPattern.toString()
                                    } 
                                } }/>
                        </div>

                        <div className='phraseFacts'>
                        {
                            pattern.wordMatches.filter(m => m instanceof PhraseMatch).map(m => 
                                <div key={ (m as PhraseMatch).phrase.id } 
                                    onClick={ () => openFact((m as PhraseMatch).phrase, this.props.corpus, this.props.tab) }
                                    className='clickable'>{ (m as PhraseMatch).phrase.id }</div>
                            )
                        }

                        {
                            pattern.wordMatches.filter(m => m instanceof ExactWordMatch).map(m =>

                                (m as ExactWordMatch).words.map(w => 
                                    <div key={ w.getWordFact().getId() } 
                                        onClick={ () => openFact(w.getWordFact(), this.props.corpus, this.props.tab) }
                                        className='clickable'>{ w.toString() }</div>
                                )

                            )
                        }
                        </div>

                        <PhraseStudyWordsComponent 
                            phrase={ phrase }
                            pattern={ pattern } 
                            corpus={ this.props.corpus }
                            sentences={ this.state.sentencesByPhrase[pattern.key] }
                            ref={ 'studyWords' + index } 
                            tab={ this.props.tab }
                            />

                        <div className='buttonBar'>
                            <div className='button' onClick={ () => this.deletePattern(pattern) }>Delete</div>
                            {
                                index > 0 ?
                                    <div className='button' onClick={ () => this.movePattern(pattern, -1) }>Up</div>
                                    :
                                    <div/>
                            }
                            {
                                index < phrase.patterns.length-1 ?
                                    <div className='button' onClick={ () => this.movePattern(pattern, 1) }>Down</div>
                                    :
                                    <div/>
                            }
                        </div>
                    </div>
                )
            }

            <div className='buttonBar'>
                <div className='button' onClick={ () => this.addPattern() }>Add pattern</div>
            </div>


        </div>

    }

}
