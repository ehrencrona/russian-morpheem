

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
    tab: string
}

let React = { createElement: createElement }

export default class TransformFactComponent extends Component<Props, State> {

    constructor(props) {
        super(props)
        
        this.state = {
            tab: 'words'
        }
    }

    render() {
        let fact = this.props.fact

        let tabButton = (id, name) =>
            <div className={ 'button ' + (this.state.tab == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ tab: id }) }}>{ name }</div>

        return (<div>

            <div className='buttonBar'>                
                { tabButton('sentences', 'Sentences') }
                { tabButton('inflection', 'Inflection') }
                { tabButton('import', 'Import') }

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
