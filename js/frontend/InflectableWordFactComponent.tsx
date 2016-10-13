

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import InflectedWord from '../shared/InflectedWord'
import InflectionFact from '../shared/inflection/InflectionFact'

import Tab from './OpenTab'
import openSentence from './sentence/openSentence'
import SentenceComponent from './SentenceComponent'
import InflectionsContainerComponent from './InflectionsContainerComponent'
import ChangeInflectionComponent from './ChangeInflectionComponent'
import MoveFactButton from './MoveFactButtonComponent'
import DeleteFactButton from './DeleteFactButtonComponent'
import TagButton from './TagButtonComponent'
import TopicButton from './TopicsButtonComponent'
import WordsWithInflectionComponent from './WordsWithInflectionComponent'
import SentencesWithFact from './SentencesWithFactComponent'
import ExternalSentences from './ExternalSentencesComponent'
import PhrasesWithWordComponent from './PhrasesWithWordComponent'
import WordTranslationComponent from './WordTranslationComponent'
import WordClassifierComponent from './WordClassifierComponent'
import FactoidComponent from './FactoidComponent'

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
        .then((sentence) => openSentence(sentence, this.props.corpus, this.props.tab))
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
                <WordTranslationComponent
                    corpus={ this.props.corpus } 
                    word={ fact } />

                <WordClassifierComponent corpus={ this.props.corpus} word={ this.props.fact } tab={ this.props.tab }/>

                <PhrasesWithWordComponent
                    word={ this.props.fact }
                    corpus={ this.props.corpus }
                    tab={ this.props.tab } />

            </div>
        }
        else if (this.state.tab == 'sentences') {
            tab = <div>
                <SentencesWithFact ref='sentencesWithFact' corpus={ this.props.corpus} fact={ this.props.fact } tab={ this.props.tab } />                
            </div>
        }
        else if (this.state.tab == 'factoid') {
            tab = <FactoidComponent 
                corpus={ this.props.corpus } 
                fact={ this.props.fact } 
                tab={ this.props.tab } />
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
                <DeleteFactButton corpus={ this.props.corpus} fact={ this.props.fact } 
                    onDelete={ () => this.props.tab.close() }/>

                <TagButton corpus={ this.props.corpus} fact={ this.props.fact } />

                <TopicButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>

            <div className='buttonBar'>
                { tabButton('inflection', 'Inflection') }
                { tabButton('sentences', 'Sentences') }
                { tabButton('factoid', 'Factoid') }
                { tabButton('import', 'Import') }
            </div>

            {tab}

        </div>)
    }
}
