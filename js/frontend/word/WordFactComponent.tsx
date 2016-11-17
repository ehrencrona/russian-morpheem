import { WordForm } from '../../shared/inflection/WordForm';


import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/inflection/InflectionFact'
import Tab from '../OpenTab'
import SentenceComponent from '../sentence/SentenceComponent'
import ChangeInflectionComponent from '../inflection/ChangeInflectionComponent'
import MoveFactButton from '../fact/MoveFactButtonComponent'
import TagButton from '../TagButtonComponent'
import WordFormComponent from './WordFormComponent'
import WordDerivationsComponent from './WordDerivationsComponent'
import TopicButton from '../TopicsButtonComponent'
import WordsWithInflectionComponent from '../inflection/WordsWithInflectionComponent'
import SentencesWithFact from '../fact/SentencesWithFactComponent'
import ExternalSentencesComponent from '../sentence/ExternalSentencesComponent'
import PhrasesWithWordComponent from '../PhrasesWithWordComponent'
import WordTranslationComponent from './WordTranslationComponent'
import WordClassifierComponent from './WordClassifierComponent'
import FactoidComponent from '../fact/FactoidComponent'

import DeleteFactButton from '../fact/DeleteFactButtonComponent'
import Sentence from '../../shared/Sentence'
import Word from '../../shared/Word'

import openSentence from '../sentence/openSentence'

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
            .then((sentence) => openSentence(sentence, this.props.corpus, this.props.tab))
        }
    }

    render() {
        let fact = this.props.fact

        let tabButton = (id, name) =>
            <div className={ 'button ' + (this.state.tab == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ tab: id }) }}>{ name }</div>

        let tab;    

        if (this.state.tab == 'word') {
            tab = <div>
                <WordFormComponent
                    corpus={ this.props.corpus}
                    word={ this.props.fact } />

                <WordTranslationComponent 
                    corpus={ this.props.corpus }
                    word={ fact } />

                <WordDerivationsComponent
                    corpus={ this.props.corpus} 
                    tab={ this.props.tab }
                    word={ this.props.fact } />

                <WordClassifierComponent 
                    corpus={ this.props.corpus} 
                    word={ this.props.fact } 
                    tab={ this.props.tab }/>

                <PhrasesWithWordComponent
                    word={ this.props.fact }
                    corpus={ this.props.corpus }
                    tab={ this.props.tab } />
            </div>
        }
        else if (this.state.tab == 'sentences') {
            tab = <SentencesWithFact 
                ref='sentencesWithFact'
                corpus={ this.props.corpus} 
                fact={ this.props.fact } 
                tab={ this.props.tab } />
        }
        else if (this.state.tab == 'import') {
            tab = <ExternalSentencesComponent 
                corpus={ this.props.corpus } 
                fact={ this.props.fact } 
                tab={ this.props.tab } />
        }
        else if (this.state.tab == 'factoid') {
            tab = <FactoidComponent 
                corpus={ this.props.corpus } 
                fact={ this.props.fact } 
                tab={ this.props.tab } />
        }

        return (<div>

            <div className='buttonBar'>                
                { tabButton('word', 'Word') }
                { tabButton('sentences', 'Sentences') }
                { tabButton('factoid', 'Factoid') }
                { tabButton('import', 'Import') }

                <div className='button' onClick={ () => this.addSentence() }>Add sentence</div>

                <MoveFactButton corpus={ this.props.corpus} fact={ this.props.fact } />
                <DeleteFactButton corpus={ this.props.corpus} fact={ this.props.fact } onDelete={ () => this.props.tab.close() } />
                <TagButton corpus={ this.props.corpus} fact={ this.props.fact } />
                <TopicButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>

            { tab }
        </div>)
    }
}
