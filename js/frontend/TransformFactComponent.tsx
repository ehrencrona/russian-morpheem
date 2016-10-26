

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import Inflection from '../shared/inflection/Inflection'

import InflectionFact from '../shared/inflection/InflectionFact'

import Tab from './OpenTab'
import MoveFactButton from './fact/MoveFactButtonComponent'
import TagButton from './TagButtonComponent'
import TopicButton from './TopicsButtonComponent'
import WordsWithInflectionComponent from './inflection/WordsWithInflectionComponent'
import ExternalSentencesComponent from './sentence/ExternalSentencesComponent'
import SentencesWithFact from './fact/SentencesWithFactComponent';

import Sentence from '../shared/Sentence'
import Word from '../shared/Word'
import Transform from '../shared/Transform'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Transform,
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

export default class TransformFactComponent extends Component<Props, State> {

    render() {
        let fact = this.props.fact

        return (<div>

            <div className='buttonBar'>
                <MoveFactButton corpus={ this.props.corpus} fact={ this.props.fact }
                    onMove={ () => (this.refs['sentencesWithFact'] as SentencesWithFact).forceUpdate() } 
                    />
                <TagButton corpus={ this.props.corpus} fact={ this.props.fact } />
                <TopicButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>
        
            <SentencesWithFact 
                ref='sentencesWithFact'
                corpus={ this.props.corpus} 
                fact={ this.props.fact } 
                tab={ this.props.tab } />
        </div>)
            
    }
}
