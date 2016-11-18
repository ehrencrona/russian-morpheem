

import Corpus from '../../shared/Corpus'

import Tab from '../OpenTab'
import MoveFactButton from '../fact/MoveFactButtonComponent'
import TagButton from '../TagButtonComponent'
import TopicButton from '../TopicsButtonComponent'

import SentencesWithFact from '../fact/SentencesWithFactComponent';

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'

import FactoidComponent from '../fact/FactoidComponent'

import { NamedWordForm } from '../../shared/inflection/WordForm'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: NamedWordForm,
    tab: Tab
}

interface State {
}

let React = { createElement: createElement }

export default class WordFormComponent extends Component<Props, State> {
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

            <FactoidComponent
                corpus={ this.props.corpus }
                tab={ this.props.tab }
                fact={ this.props.fact }
            />

        </div>)
            
    }
}
