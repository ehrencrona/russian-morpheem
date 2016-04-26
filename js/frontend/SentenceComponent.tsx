/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus';
import Fact from '../shared/Fact';
import Word from '../shared/Word';
import InflectedWord from '../shared/InflectedWord';
import Sentence from '../shared/Sentence';
import { Tab } from './TabSetComponent'
import WordSearchComponent from './WordSearchComponent';
import SentenceEditorComponent from './SentenceEditorComponent';

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    sentence: Sentence,
    tab: Tab
}

interface State {
    sentence?: Sentence
}

let React = { createElement: createElement }

interface FactIndex {
    index: number,
    fact: Fact
}

function randomInt() {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
}

export default class SentenceComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
        
        this.state = {
            sentence: props.sentence
        }
    }
    
    duplicate() {
        let sentence = new Sentence(this.props.sentence.words, randomInt()).setEnglish(this.props.sentence.en())

        this.props.corpus.sentences.add(sentence)

        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null } />, 
            sentence.toString(), sentence.getId().toString())
    }

    delete() {
        let sentence = new Sentence(this.props.sentence.words, randomInt())
            .setEnglish(this.props.sentence.en())

        this.props.corpus.sentences.remove(this.props.sentence)
        
        this.props.tab.close()
    }
        
    render() {
        let factsById = {}
        
        this.state.sentence.visitFacts((fact: Fact) => {
            factsById[fact.getId()] = fact
        })
        
        let sortedFacts: FactIndex[] = []

        for (let id in factsById) {
            let fact = factsById[id]

            sortedFacts.push({
                index: this.props.corpus.facts.indexOf(fact),
                fact: fact
            })
        }

        sortedFacts = sortedFacts.sort((f1, f2) => f1.index - f2.index)

        let factIndexToElement = (factIndex : FactIndex) => 
            <div key={ factIndex.fact.getId() }>{factIndex.index}: {factIndex.fact.getId()}
            </div>

        let editor: SentenceEditorComponent
        let wordSearch: WordSearchComponent

        return (<div>
            <div className='buttonBar'>
                <div className='button' onClick={ () => this.duplicate() }>Duplicate</div>
                <div className='button' onClick={ () => this.delete() }>Delete</div>
            </div>

            <SentenceEditorComponent 
                corpus={ this.props.corpus } 
                words={ this.props.sentence.words }
                onWordSelect={ (word: Word) => { 
                    wordSearch.setWord((word instanceof InflectedWord ? word.infinitive : word)) }} 
                ref={ (ref) => { editor = ref } }
                onSentenceChange={ (words: Word[]) => {
                    let sentence = new Sentence(words, this.state.sentence.id)

                    this.setState({ sentence: sentence })

                    this.props.corpus.sentences.store(sentence)
                } }/>

            <WordSearchComponent 
                corpus={ this.props.corpus } 
                tab={ this.props.tab } 
                onWordSelect={ (word) => { editor.setWord(word) } } 
                ref={ (ref) => { wordSearch = ref } }/>
            
            <div>
            {
                sortedFacts.map(factIndexToElement)
            }
            </div> 
        </div>)
    }
}
