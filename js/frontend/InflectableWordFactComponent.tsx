/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import InflectedWord from '../shared/InflectedWord'
import InflectionFact from '../shared/inflection/InflectionFact'

import Tab from './OpenTab'
import FactComponent from './FactComponent'
import SentenceComponent from './SentenceComponent'
import InflectionsContainerComponent from './InflectionsContainerComponent'
import ChangeInflectionComponent from './ChangeInflectionComponent'
import MoveFactButton from './MoveFactButtonComponent'
import TagButton from './TagButtonComponent'
import WordsWithInflectionComponent from './WordsWithInflectionComponent'
import SentencesWithFact from './SentencesWithFactComponent';
import ExternalSentences from './ExternalSentencesComponent';

import Sentence from '../shared/Sentence'
import InflectableWord from '../shared/InflectableWord'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    fact: InflectableWord,
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
            tab: 'inflection'
        }
    }

    addSentence() {
        let fact = this.props.fact
        
        let sentence = new Sentence([ fact.getDefaultInflection() ], null)

        this.props.corpus.sentences.add(sentence)
        .then((sentence) => this.openSentence(sentence))
    }

    openSentence(sentence: Sentence) {
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
    }

    openFact(fact: Fact) {
        this.props.tab.openTab(
            <FactComponent corpus={ this.props.corpus } fact={ fact } tab={ null }/>,
            fact.getId(),
            fact.getId()
        )
    }

    render() {
        let fact = this.props.fact
        let inflections
        
        let tabButton = (id, name) =>
            <div className={ 'button ' + (this.state.tab == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ tab: id }) }}>{ name }</div>

        let tab;    

        if (this.state.tab == 'inflection') {
            tab = <div>                            
                <ChangeInflectionComponent
                    corpus={ this.props.corpus } 
                    tab={ this.props.tab }
                    word={ fact }
                    onChange={ () => inflections.forceUpdate() } />
                <InflectionsContainerComponent 
                    corpus={ this.props.corpus } 
                    inflection={ fact.inflection } 
                    word={ fact } 
                    tab={ this.props.tab }
                    ref={ (component) => inflections = component} />
            </div>
        }
        else if (this.state.tab == 'sentences') {
            tab = <SentencesWithFact ref='sentencesWithFact' corpus={ this.props.corpus} fact={ this.props.fact } tab={ this.props.tab } />
        }
        else {
            tab = <ExternalSentences corpus={ this.props.corpus} fact={ this.props.fact } tab={ this.props.tab } />
        }

        return (<div>

            <div className='buttonBar'>
                <div className='button' onClick={ () => this.addSentence() }>Add sentence</div>

                <MoveFactButton corpus={ this.props.corpus} fact={ this.props.fact } 
                    onMove={ () => 
                        (this.refs['sentencesWithFact'] as SentencesWithFact).forceUpdate() } 
                />

                <TagButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>

            <div className='buttonBar'>
                { tabButton('inflection', 'Inflection') }
                { tabButton('sentences', 'Sentences') }
                { tabButton('import', 'Import') }
            </div>

            {tab}

        </div>)
    }
}
