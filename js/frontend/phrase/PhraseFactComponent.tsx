/// <reference path="../../../typings/react/react.d.ts" />

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'

import Tab from '../OpenTab'
import MoveFactButton from '../MoveFactButtonComponent'
import DeleteFactButton from '../DeleteFactButtonComponent'
import TagButton from '../TagButtonComponent'
import SentencesWithFact from '../SentencesWithFactComponent'
import AddSentenceToPhraseComponent from './AddSentenceToPhraseComponent'
import PhrasePatternComponent from './PhrasePatternComponent'
import MatchingSentencesComponent from './MatchingSentencesComponent'

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
            tab = <MatchingSentencesComponent 
                corpus={ this.props.corpus }
                match={ fact.patterns[0] }
                tab={ this.props.tab }
                filter={ (sentence) => !!sentence.hasPhrase(fact) }
                ref='sentences'
                buttonFactory={ (sentence) => 
                    <div className='button' onClick={ 
                        () => { 
                            this.props.corpus.sentences.removePhrase(fact, sentence);

                            (this.refs['sentences'] as Component<any, any>).forceUpdate() 
                    } } >Remove</div>
                }
            />
        }
        else {
            tab = <AddSentenceToPhraseComponent 
                corpus={ this.props.corpus } 
                phrase={ fact } 
                tab={ this.props.tab } />
        }

        return (<div className='phrase'>

            <div className='buttonBar'>                
                { tabButton('sentences', 'Sentences') }
                { tabButton('find', 'Matching') }
                <MoveFactButton corpus={ this.props.corpus} 
                    fact={ this.props.fact }
                    onMove={ () => (this.refs['sentencesWithFact'] as SentencesWithFact).forceUpdate() } 
                    />

                <DeleteFactButton corpus={ this.props.corpus} fact={ this.props.fact } 
                    onDelete={ () => this.props.tab.close() }/>

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
