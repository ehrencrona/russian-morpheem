

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Fact
}

interface State {
    open?: boolean
    add?: boolean
}

let React = { createElement: createElement }

export default class TagButtonComponent extends Component<Props, State> {
    addTag: HTMLInputElement
    selectTag: HTMLSelectElement
    
    constructor(props) {
        super(props)
        
        this.state = {
            add: !this.props.corpus.facts.getAllTags().length,
            open: !!localStorage.getItem('lastTagOpen')
        }

    }
    
    untag(tag: string) {
        this.props.corpus.facts.untag(this.props.fact, tag)
        
        this.forceUpdate()
    }

    tag(tag: string) {
        localStorage.setItem('lastTag', tag)
        
        this.props.corpus.facts.tag(this.props.fact, tag)
        
        this.setState({ add: false })
    }

    toggleOpenState() {
        this.setState({ open: !this.state.open })

        localStorage.setItem('lastTagOpen', (this.state.open ? '' : 'true'))
    }

    render() {
        let lastTag = localStorage.getItem('lastTag')

        let existingTags = this.props.corpus.facts.getTagsOfFact(this.props.fact) 
        let tags = this.props.corpus.facts.getAllTags().filter((tag) => existingTags.indexOf(tag) < 0)

        tags.sort();

        return !this.state.open ?
            <div className='button' onClick={ () => {
                this.toggleOpenState() 
            }}>Tags</div>

            :

            <div className='tags'>
                <h3 onClick={ () => {
                    this.toggleOpenState() 
                }}>Tags</h3>

                <div className='content'>
                    <div className='existing'>
                    { existingTags.length ? 
                        <ul>{
                            existingTags.map(tag => <li
                                key={ tag } 
                                className='tag' 
                                onClick={ () => this.untag(tag) }>{ tag }</li>)
                        }</ul>
                        :
                        <i>No tags.</i>
                    }
                    </div>

                    <div className='add'>
                        { (this.state && this.state.add ?
                                
                            <input type='text' lang='en' autoCapitalize='off' ref={ 
                                (element) => { if (element) element.focus(); this.addTag = element } }/>
                            
                            :
                            
                            <select ref={ (element) => { this.selectTag = element } } defaultValue={ lastTag } onChange={ 
                                    () => this.setState({ add:     
                                        this.selectTag.value == 'newTag' })
                                } >
                            { [                        
                                    tags.map((tag) =>
                                        <option key={ tag } value={ tag }>{ tag }</option>  
                                    ),
                                    <option key='newTag' value='newTag'>Add Tag</option>
                            ] }
                            </select>
                        ) }

                        <div className='button' onClick={ () => {
                            let tag = (this.selectTag || this.addTag).value
                            
                            this.tag(tag) 
                        }}>Add</div>
                    </div>
                </div>
            </div>
    }
}
