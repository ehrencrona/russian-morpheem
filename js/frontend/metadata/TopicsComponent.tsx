
import {Component,createElement} from 'react'

import Corpus from '../../shared/Corpus'
import { Topics, Topic } from '../../shared/metadata/Topics'
import AddTopicComponent from './AddTopicComponent'

import Tab from '../OpenTab'
import openTopic from './openTopic'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {
    topics?: Topic[]
    add?: boolean
}

let React = { createElement: createElement }

export default class TopicsComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            topics: []
        }
    }
    
    componentDidMount() {
        this.props.corpus.topics.getAll().then(topics => this.setState({ topics : topics}))
    }

    addTopic() {
        this.setState({ add: true })
    }

    render() {
        return (<div className='topics'>
                <div className='buttonBar'>

                    <div className='button' onClick={ () => { this.addTopic() }}>+ Topic</div>
                </div>

                {
                    this.state.add ?
                        <AddTopicComponent 
                            corpus={ this.props.corpus } 
                            tab={ this.props.tab }
                            onClose={ () => this.setState({ add: false }) } /> :

                    <ul>
                    { 
                        this.state.topics.map(t => 
                            <li key={ t.id }
                                onClick={ () => openTopic(t, this.props.corpus, this.props.tab) }>{ t.name || t.id }
                            </li>
                        ) 
                    }
                    </ul>
                }
            </div>)
    }
}
