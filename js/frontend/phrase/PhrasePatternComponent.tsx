/// <reference path="../../../typings/react/react.d.ts" />

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'
import htmlEscape from '../../shared/util/htmlEscape'
import PhrasePattern from '../../shared/phrase/PhrasePattern'
import PhraseStudyWordsComponent from './PhraseStudyWordsComponent'

import { MISSING_INDEX } from '../../shared/fact/Facts'
import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus
    phrase: Phrase
    onChange: () => void
}

interface State {
    error?: string
}

let React = { createElement: createElement }

export default class PhrasePatternComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    changeDescription(newDescription: string) {
        this.props.corpus.phrases.setDescription(this.props.phrase, newDescription)
    }

    changeEnglish(english: string, pattern: PhrasePattern, index: number) {
        if (english == pattern.en) {
            return
        }

        this.props.corpus.phrases.setEnglish(this.props.phrase, pattern, english);

        (this.refs['studyWords' + index] as PhraseStudyWordsComponent).forceUpdate() 
    }

    changePattern(patternStr: string, oldPattern: PhrasePattern) {
        try {
            let newPattern = PhrasePattern.fromString(patternStr.trim(), oldPattern.en,
                this.props.corpus.words, this.props.corpus.inflections)

            this.setState({ error: null })

            if (newPattern.toString() == oldPattern.toString()) {
                return
            }

            let patterns = this.props.phrase.patterns.map((p) => 
                (p == oldPattern ? newPattern : p))

            this.props.corpus.phrases.setPattern(this.props.phrase, patterns)

            this.props.onChange();

            return newPattern
        }
        catch (e) {
            this.setState({ error: e.toString() })
        }
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
                    Name
                </div>
            
                <input type='text' lang={ this.props.corpus.lang } autoCapitalize='off' defaultValue={ phrase.description } 
                    onBlur={ (e) => this.changeDescription((e.target as HTMLInputElement).value) }/>
            </div>

            {  
                phrase.patterns.map((pattern, index) => 

                    <div key={ index } className='pattern'>
                        <h3>Pattern</h3>

                        <div className='field'>
                            <div className='label'>
                                English
                            </div>
                        
                            <input type='text' lang='en' autoCapitalize='off' defaultValue={ pattern.en } 
                                onBlur={ (e) => this.changeEnglish((e.target as HTMLInputElement).value, pattern, index) }/>
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

                        <PhraseStudyWordsComponent 
                            phrase={ phrase }
                            pattern={ pattern } 
                            corpus={ this.props.corpus }
                            ref={ 'studyWords' + index } 
                            />
                    </div>
                )
            }

            <div className='buttonBar'>
                <div className='button' onClick={ () => this.addPattern() }>Add pattern</div>
            </div>


        </div>

    }

}
