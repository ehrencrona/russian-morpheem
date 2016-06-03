/// <reference path="../../typings/react/react.d.ts" />

import {Component, cloneElement, createElement} from 'react';
import Facts from './FactsComponent';
import Fact from './FactComponent';
import Tab from './Tab';
import Corpus from '../shared/Corpus';
import InflectedWord from '../shared/InflectedWord';
import InflectableWord from '../shared/InflectableWord';
import NoSuchWordError from '../shared/NoSuchWordError'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    onClose: () => any,
    tab: Tab
}

interface State {
    word?: string,
    inflection?: string
}

export default class AddWordComponent extends Component<Props, State> {
    word: HTMLInputElement

    constructor(props) {
        super(props)
        
        this.state = { word: '' }     
    }
    
    componentDidMount() {
        this.word.focus();
    }
    
    submit() {
        let wordString = this.state.word
        
        if (wordString) {
            let existingFact = this.props.corpus.facts.get(wordString)
            
            if (existingFact) {
                this.props.tab.openTab(
                    <Fact fact={ existingFact } corpus={ this.props.corpus } tab={ null }/>,
                    existingFact.toString(),
                    existingFact.getId()
                )

                return
            }
            
            this.props.corpus.inflections.generateInflectionForWord(wordString)
                .catch((e) => {
                    if (e instanceof NoSuchWordError) {
                        alert('Unknown word.')
                    }
                    else {
                        alert('Something went wrong: ' + e)
                    }
                })
                .then((inflection) => {
                    if (!inflection) {
                        return
                    }
                    
                    let word = new InflectableWord(inflection.stem, inflection.inflection)

                    this.props.corpus.words.addInflectableWord(word)
                    this.props.corpus.facts.add(word)

                    this.props.tab.openTab(
                        <Fact fact={ word } corpus={ this.props.corpus } tab={ null }/>,
                        word.toString(),
                        word.getId()
                    )
                                    
                    this.props.onClose();
                })
        }
    }
    
    render() {
        return <div className='addWord'>
            <input type='text' 
                ref={ (input) => this.word = input }
                onChange={ (event) => {
                        let target = event.target

                        if (target instanceof HTMLInputElement) {                        
                            this.setState({ word: target.value })
                        }
                    }
                }
                onKeyPress={ (event) => {                    
                    if (event.charCode == 13) {
                        this.submit() 
                    }}
                } />                
            
            <div className='button' onClick={ () => this.submit() }>Add</div>
        </div>;
    }
}