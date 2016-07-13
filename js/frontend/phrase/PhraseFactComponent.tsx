/// <reference path="../../../typings/react/react.d.ts" />

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Tab from '../Tab'
import MoveFactButton from '../MoveFactButtonComponent'
import TagButton from '../TagButtonComponent'
import SentencesWithFact from '../SentencesWithFactComponent'
import FindPhraseComponent from './FindPhraseComponent'
import PhrasePatternComponent from './PhrasePatternComponent'

import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Phrase,
    tab: Tab
}

interface State {
    tab: string
}

let React = { createElement: createElement }

export default class PhraseFactComponent extends Component<Props, State> {

    constructor(props) {
        super(props)
        
        this.state = {
            tab: 'sentences'
        }
    }

    render() {
        let fact = this.props.fact

        let tabButton = (id, name) =>
            <div className={ 'button ' + (this.state.tab == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ tab: id }) }}>{ name }</div>

        let tab;    

        if (this.state.tab == 'sentences') {
            tab = <SentencesWithFact 
                ref='sentencesWithFact'
                corpus={ this.props.corpus} 
                fact={ this.props.fact } 
                tab={ this.props.tab } />
        }
        else {
            tab = <FindPhraseComponent 
                corpus={ this.props.corpus } 
                phrase={ fact } 
                tab={ this.props.tab } />
        }

        return (<div className='phrase'>

            <div className='buttonBar'>                
                { tabButton('sentences', 'Sentences') }
                { tabButton('find', 'Find Sentences') }
                <MoveFactButton corpus={ this.props.corpus} fact={ this.props.fact }
                    onMove={ () => (this.refs['sentencesWithFact'] as SentencesWithFact).forceUpdate() } 
                    />

                <TagButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>

            <PhrasePatternComponent 
                phrase={ this.props.fact } 
                corpus={ this.props.corpus } 
                onChange={ () => { this.forceUpdate() } } />
        
            { tab }
        </div>)
            
    }
}
