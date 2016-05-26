/// <reference path="../../typings/react/react.d.ts" />

import {Component, cloneElement, createElement} from 'react';
import Facts from './FactsComponent';
import Fact from './FactComponent';
import Tab from './Tab';
import Corpus from '../shared/Corpus';
import InflectedWord from '../shared/InflectedWord';

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
            let inflection = this.props.corpus.inflections.getInflection(
                this.state.inflection)
            
            let defaultEnding = inflection.getEnding(inflection.defaultForm)
            let stem = wordString.substr(0, wordString.length-defaultEnding.suffix.length)

            let word = new InflectedWord(
                    wordString, 
                    null, inflection.defaultForm)
                .setInflection(inflection)
                .setEnglish('n/a', '')

            this.props.corpus.words.add(word)
            this.props.corpus.facts.add(word)

            this.props.tab.openTab(
                <Fact fact={ word } corpus={ this.props.corpus } tab={ null }/>,
                word.toString(),
                word.getId()
            )
                            
            this.props.onClose();
        }
    }

    updateInflections(word) {
        let best = this.props.corpus.inflections.getBestInflection(word);
        
        this.setState({ inflection: best.id })
    }
    
    render() {
        let possible = this.props.corpus.inflections.getPossibleInflections(this.state.word);

        return <div className='addWord'>
            <input type='text' 
                ref={ (input) => this.word = input }
                onChange={ (event) => {
                        let target = event.target

                        if (target instanceof HTMLInputElement) {                        
                            this.setState({ word: target.value })
                            
                            this.updateInflections(target.value)
                        }
                    }
                }
                onKeyPress={ (event) => {                    
                    if (event.charCode == 13) {
                        this.submit() 
                    }}
                } />                
            <select
                onChange={ (event) => {
                        let target = event.target
                        
                        if (target instanceof HTMLSelectElement) {
                            this.setState({ inflection: target.value })
                        }
                    }
                }
                value={ this.state.inflection }>
                {
                    possible.map((inflection) => 
                        <option key={ inflection.id } value={ inflection.id }>{
                            inflection.id + ' (' + inflection.pos + ')' }</option>
                    )
                }
            </select>
            
            <div className='button' onClick={ () => this.submit() }>Add</div>
        </div>;
    }
}