/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Fact
}

interface State {
    add: boolean
}

let React = { createElement: createElement }

export default class TagButtonComponent extends Component<Props, State> {
    addTag: HTMLInputElement
    selectTag: HTMLSelectElement
    
    constructor(props) {
        super(props)
        
        this.state = {
            add: !this.props.corpus.facts.getAllFacts().length
        }
    }
    
    tag(tag: string) {
        localStorage.setItem('lastTag', tag)
        
        this.props.corpus.facts.tag(this.props.fact, tag)
        
        this.setState({ add: false })
    }

    render() {
        let factIndex = this.props.corpus.facts.indexOf(this.props.fact) + 1;

        let lastTag = localStorage.getItem('lastTag')

        return <div className='tag'>
            { this.state && this.state.add ?
                    
                <input type='text' ref={ (element) => { if (element) element.focus(); this.addTag = element } }/>
                
                :
                
                <select ref={ (element) => { this.selectTag = element } } defaultValue={ lastTag } onChange={ 
                        () => this.setState({ add:     
                            this.selectTag.value == 'newTag' })
                    } >
                { [                        
                        this.props.corpus.facts.getAllFacts().map((tag) =>
                            <option key={ tag } value={ tag }>{ tag }</option>  
                        ),
                        <option key='newTag' value='newTag'>Add Tag</option>
                ] }
                </select>
                
            }
            <div className='button' onClick={ () => {
                let tag = (this.selectTag || this.addTag).value
                 
                this.tag(tag) 
            }}>Tag</div>
        </div>;
    }
}
