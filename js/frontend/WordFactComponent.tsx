/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import InflectedWord from '../shared/InflectedWord'
import InflectionFact from '../shared/inflection/InflectionFact'

import Tab from './OpenTab'
import FactComponent from './FactComponent'
import SentenceComponent from './SentenceComponent'
import InflectionsComponent from './InflectionsComponent'
import ChangeInflectionComponent from './ChangeInflectionComponent'
import MoveFactButton from './MoveFactButtonComponent'
import TagButton from './TagButtonComponent'
import WordsWithInflectionComponent from './WordsWithInflectionComponent'
import SentencesWithFact from './SentencesWithFactComponent';
import ExternalSentencesComponent from './ExternalSentencesComponent';

import Sentence from '../shared/Sentence'
import Word from '../shared/Word'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: Word,
    tab: Tab
}

interface State {
    tab: string
}

let React = { createElement: createElement }

export default class WordFactComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
        
        this.state = {
            tab: 'sentences'
        }
    }

    addSentence() {
        let fact = this.props.fact
        
        if (fact instanceof Word) {
            let sentence = new Sentence([ fact ], null)

            this.props.corpus.sentences.add(sentence)
            .then((sentence) => this.openSentence(sentence))
        }
    }

    openSentence(sentence: Sentence) {
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
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
        else if (this.state.tab == 'import') {
            tab = <ExternalSentencesComponent corpus={ this.props.corpus } fact={ this.props.fact } tab={ this.props.tab } />
        }

        return (<div>

            <div className='buttonBar'>                
                { tabButton('sentences', 'Sentences') }
                { tabButton('import', 'Import') }

                <div className='button' onClick={ () => this.addSentence() }>Add sentence</div>

                <MoveFactButton corpus={ this.props.corpus} fact={ this.props.fact } />
                <TagButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>

            { tab }
        </div>)
    }
}
