
import { Component, createElement } from 'react'

import Corpus from '../../shared/Corpus'
import { Topic } from '../../shared/metadata/Topics'
import { FixedIntervalFactSelector, REPETITION_COUNT } from '../../shared/study/FixedIntervalFactSelector'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus
    onCancel: () => any
    onSelect: (topic: Topic) => any
    factSelector: FixedIntervalFactSelector
}

interface State {
    topics?: Topic[]
}

export default class TopicsComponent extends Component<Props, State> {

    constructor(props) {
        super(props)

        this.state = {}
    }

    componentWillMount() {

        this.props.corpus.topics.getAll().then(all => this.setState({ topics: all }))

    }

    getTopicKnowledge(topic: Topic) {

        const FOREVER = 7 * 24 * 60 * 60 * 1000

        let expectedReps = 0

        let facts = topic.getFacts()

        if (!facts.length) {
            return 0
        }

        facts.forEach(f => {

            expectedReps += this.props.factSelector.getExpectedRepetitions(f, true)

        })

        let totalReps = REPETITION_COUNT * facts.length

console.log('expected', expectedReps, 'total', totalReps)

        return Math.max(1 - expectedReps / totalReps, 0)

    }

    renderProgress(topic: Topic) {
        let percentage = Math.round(100 * this.getTopicKnowledge(topic))

        return <div className='progress'>
            <div className='barContainer'>
                <div className={ 'start' + (percentage == 0 ? ' empty' : '')}>&nbsp;</div>
            
                <div className='bar'>
                    <div className='full' style={ { width: percentage + '%' }}>&nbsp;</div>
                </div>

                <div className={ 'end'  + (percentage == 100 ? ' full' : '') }>&nbsp;</div>
            </div>
        </div>
    }

    render() {

        return <div className='topics'>

            <ul>{

                (this.state.topics || []).map(topic => <li key={ topic.id } 
                        onClick={ () => this.props.onSelect(topic) } >
                    <div className='name'>{ topic.name }</div>
                    <div className='description'>{ topic.description }</div>
                    { this.renderProgress(topic) }
                </li>)

            }</ul>

            <div className='button done' onClick={ this.props.onCancel }>
                Cancel
            </div> 

        </div>

    }

}
