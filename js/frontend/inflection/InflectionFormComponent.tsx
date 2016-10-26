

import Corpus from '../../shared/Corpus'

import Tab from '../OpenTab'
import MoveFactButton from '../fact/MoveFactButtonComponent'
import TagButton from '../TagButtonComponent'
import TopicButton from '../TopicsButtonComponent'

import SentencesWithFact from '../fact/SentencesWithFactComponent';

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'

import FactoidComponent from '../fact/FactoidComponent'

import { InflectionForm } from '../../shared/inflection/InflectionForms'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: InflectionForm,
    tab: Tab
}

interface State {
    tab: string
}

let React = { createElement: createElement }

export default class InflectionFormComponent extends Component<Props, State> {

    constructor(props) {
        super(props)
        
        this.state = {
            tab: 'form'
        }
    }

    render() {
        let fact = this.props.fact

        let tabButton = (id, name) =>
            <div className={ 'button ' + (this.state.tab == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ tab: id }) }}>{ name }</div>

        return (<div>

            <div className='buttonBar'>                
                { tabButton('form', 'Form') }
                { tabButton('sentences', 'Sentences') }

                <MoveFactButton corpus={ this.props.corpus} fact={ this.props.fact }
                    onMove={ () => (this.refs['sentencesWithFact'] as SentencesWithFact).forceUpdate() } 
                    />
                <TagButton corpus={ this.props.corpus} fact={ this.props.fact } />
                <TopicButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>

            {
                this.state.tab == 'form' ?

                <div>

                    <FactoidComponent
                        corpus={ this.props.corpus }
                        tab={ this.props.tab }
                        fact={ this.props.fact }
                    />

                </div>

                :

                <SentencesWithFact 
                    ref='sentencesWithFact'
                    corpus={ this.props.corpus} 
                    fact={ this.props.fact } 
                    tab={ this.props.tab } />
            }
        </div>)
            
    }
}
