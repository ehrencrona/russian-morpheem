

import {Component, cloneElement, createElement} from 'react';
import Tab from '../OpenTab'
import Fact from '../../shared/fact/Fact';
import Corpus from '../../shared/Corpus';
import { Topic } from '../../shared/metadata/Topics';
import openTopic from './openTopic'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    onClose: () => any,
    tab: Tab
}

interface State {
    topicId?: string
}

export default class AddTopicComponent extends Component<Props, State> {
    word: HTMLInputElement

    constructor(props) {
        super(props)
        
        this.state = { topicId: '' }     
    }
    
    componentDidMount() {
        this.word.focus();
    }
    
    submit() {
        let corpus = this.props.corpus
        let topicId = this.state.topicId
        
        if (topicId && topicId.indexOf(' ') < 0) {
            corpus.topics.getTopic(topicId)
            .then(existingFact => {
                if (existingFact) {
                    openTopic(existingFact, corpus, this.props.tab)

                    return
                }
                
                corpus.topics.addTopic(topicId).then(
                    topic =>
                        openTopic(topic, corpus, this.props.tab)
                )

                this.props.onClose()
            })
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
                            this.setState({ topicId: target.value })
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
                No spaces, use dashes e.g. "genitive-advanced". Can't be changed later.
            </div>
        </div>;
    }
}