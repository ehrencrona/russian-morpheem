/// <reference path="../../../typings/react/react.d.ts" />

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'
import htmlEscape from '../../shared/util/htmlEscape'
import PhraseMatch from '../../shared/phrase/PhraseMatch'

import { MISSING_INDEX } from '../../shared/fact/Facts'
import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    phrase: Phrase,
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

    changePattern(newPattern: string) {
        let pattern

        try {
            pattern = PhraseMatch.fromString(newPattern.trim(), this.props.corpus.words)

            this.props.corpus.phrases.setPattern(this.props.phrase, [ pattern ])

            this.setState({ error: null })

            this.props.onChange()
        }
        catch (e) {
            this.setState({ error: e.toString() })
        }
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
            
                <input type='text' defaultValue={ phrase.description } 
                    onBlur={ (e) => this.changeDescription((e.target as HTMLInputElement).value) }/>
            </div>

            <div className='field'>
                <div className='label'>
                    Pattern
                </div>
            
                <input type='text' defaultValue={ phrase.patterns[0] && phrase.patterns[0].toString() } 
                    onBlur={ (e) => this.changePattern((e.target as HTMLInputElement).value) }/>
            </div>

        </div>

    }

}
