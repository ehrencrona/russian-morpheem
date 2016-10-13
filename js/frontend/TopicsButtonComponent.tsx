

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import { Topic } from '../shared/metadata/Topics'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Fact
}

interface State {
    open?: boolean
    existing?: Topic[]
    all?: Topic[]
}

let React = { createElement: createElement }

export default class TopicsButtonComponent extends Component<Props, State> {
    addTopic: HTMLInputElement
    selectTopic: HTMLSelectElement
    
    constructor(props) {
        super(props)
        
        this.state = {
            open: !!localStorage.getItem('lastTopicOpen')
        }
    }

    componentWillMount() {
        if (this.state.open) {
            this.load()
        }
    }

    load() {
        if (this.state.all) {
            return
        }

        Promise.all([
            this.props.corpus.topics.getTopicsOfFact(this.props.fact),
            this.props.corpus.topics.getAll()
        ]).then(
            ([ existing, all ]) => {
                this.setState({
                    existing: existing,
                    all: all
                })
            }
        )
    }
    
    add(topic: Topic) {
        topic.addFact(this.props.fact)
        
        localStorage.setItem('lastTopic', topic.id)
        
        this.setState({
            existing: this.state.existing.concat(topic)
        })
    }

    remove(topic: Topic) {
        topic.removeFact(this.props.fact)

        this.setState({
            existing: this.state.existing.filter(t => t != topic)
        })
    }

    toggleOpenState() {
        this.load();
        this.setState({ open: !this.state.open })

        localStorage.setItem('lastTopicOpen', (this.state.open ? '' : 'true'))
    }

    render() {
        if (!this.state.open || !this.state.all) {
            return  <div className='button' onClick={ () => {
                this.toggleOpenState() 
            }}>Topics</div>
        }
        else {
            let lastTopic = localStorage.getItem('lastTopic')

            let existingTopics = this.state.existing 
            let all = this.state.all.filter((topic) => existingTopics.indexOf(topic) < 0)

            all.sort((a, b) => a.name.localeCompare(b.name));

            return <div className='tags'>
                <h3 onClick={ () => {
                    this.toggleOpenState() 
                }}>Topics</h3>

                <div className='content'>
                    <div className='existing'>
                    { existingTopics.length ? 
                        <ul>{
                            existingTopics.map(topic => <li
                                key={ topic.id } 
                                className='tag' 
                                onClick={ () => this.remove(topic) }>{ topic.name }</li>)
                        }</ul>
                        :
                        <i>No topics.</i>
                    }
                    </div>

                    <div className='add'>
                        <select ref={ (element) => { this.selectTopic = element } } defaultValue={ lastTopic }>
                        { [                        
                            all.map((topic) =>
                                <option key={ topic.id } value={ topic.id }>{ topic.name }</option>  
                            )
                        ] }
                        </select>

                        <div className='button' onClick={ () => {
                            let addTopic = all.find(topic => topic.id == this.selectTopic.value)
                            
                            console.log('add', addTopic)
                            this.add(addTopic) 
                        }}>Add</div>
                    </div>
                </div>
            </div>
        }
    }
}
