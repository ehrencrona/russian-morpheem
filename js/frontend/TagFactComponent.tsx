

import TagFact from '../shared/TagFact'
import Corpus from '../shared/Corpus'

import Fact from '../shared/fact/Fact'

import Inflection from '../shared/inflection/Inflection'
import InflectionFact from '../shared/inflection/InflectionFact'

import Tab from './OpenTab'
import TopicButton from './TopicsButtonComponent'

import MoveFactButton from './fact/MoveFactButtonComponent'

import FactoidComponent from './fact/FactoidComponent'


import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: TagFact,
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

export default class TagFactComponent extends Component<Props, State> {

    render() {
        let fact = this.props.fact

        return (<div>

            <div className='buttonBar'>
                <MoveFactButton corpus={ this.props.corpus} fact={ this.props.fact }
                    />
                <TopicButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>

            <FactoidComponent 
                corpus={ this.props.corpus } 
                fact={ this.props.fact } 
                tab={ this.props.tab } />
        </div>)
            
    }
}
