/// <reference path="../../typings/react/react.d.ts" />

import {Component, cloneElement, createElement} from 'react';
import Tab from './OpenTab'
import Fact from '../shared/fact/Fact';
import Corpus from '../shared/Corpus';
import Phrase from '../shared/phrase/Phrase';
import openFact from './fact/openFact'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    onClose: () => any,
    tab: Tab
}

interface State {
    phraseId?: string
}

export default class AddWordComponent extends Component<Props, State> {
    word: HTMLInputElement

    constructor(props) {
        super(props)
        
        this.state = { phraseId: '' }     
    }
    
    componentDidMount() {
        this.word.focus();
    }
    
    submit() {
        let corpus = this.props.corpus
        let phraseId = this.state.phraseId
        
        if (phraseId && phraseId.indexOf(' ') < 0) {
            let existingFact = corpus.phrases.get(phraseId)
            
            if (existingFact) {
                openFact(existingFact, this.props.corpus, this.props.tab)

                return
            }
            
            let phrase = new Phrase(phraseId, [])

            corpus.phrases.add(phrase)
            corpus.facts.add(phrase)

            openFact(phrase, this.props.corpus, this.props.tab)

            this.props.onClose()
        }
    }

    render() {
        return <div className='addPhrase'>
            <div className='label'>
                ID
            </div>
            <input type='text' autoCapitalize='off' 
                ref={ (input) => this.word = input }
                onChange={ (event) => {
                        let target = event.target

                        if (target instanceof HTMLInputElement) {                        
                            this.setState({ phraseId: target.value })
                        }
                    }
                }
                onKeyPress={ (event) => {                    
                    if (event.charCode == 13) {
                        this.submit() 
                    }}
                } />
            
            <div className='button' onClick={ () => this.submit() }>Add</div>
            <div className='description'>
                No spaces, use dashes e.g. "acc-time". Can't be changed later.
            </div>
        </div>;
    }
}