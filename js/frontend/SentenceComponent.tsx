

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import Word from '../shared/Word'
import Words from '../shared/Words'
import InflectedWord from '../shared/InflectedWord'
import UnparsedWord from '../shared/UnparsedWord';
import Sentence from '../shared/Sentence'
import { MISSING_INDEX } from '../shared/fact/Facts'
import Tab from './OpenTab'

import FactNameComponent from './FactNameComponent'
import WordSearchComponent from './WordSearchComponent'
import SentenceEditorComponent from './SentenceEditorComponent'
import SentenceHistoryComponent from './metadata/SentenceHistoryComponent'
import SentenceStatusComponent from './metadata/SentenceStatusComponent'
import SentenceTranslationComponent from './SentenceTranslationComponent'
import SentencePhrasesComponent from './phrase/SentencePhrasesComponent'

import openFact from './fact/openFact'
import { Component, createElement } from 'react'

interface Props {
    corpus: Corpus
    sentence: Sentence
    tab: Tab
}

interface State {
    sentence?: Sentence
    factsOpen?: boolean
    phrasesOpen?: boolean    
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
        let sentence = new Sentence(this.props.sentence.words.slice(0), null).setEnglish(this.props.sentence.en())

        this.props.corpus.sentences.add(sentence)
        .then((sentence) => {
            this.props.tab.openTab(
                <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null } />, 
                sentence.toString(), sentence.getId().toString())
        })

    }

    delete() {
        let sentence = new Sentence(this.props.sentence.words, randomInt())
            .setEnglish(this.props.sentence.en())

        this.props.corpus.sentences.remove(this.props.sentence)
        
        this.props.tab.close()
    }

    componentDidRender

    render() {
        let factsById = {}
        
        this.state.sentence.visitFacts((fact: Fact) => {
            factsById[fact.getId()] = fact
        })
        
        let sortedFacts: FactIndex[] = []

        for (let id in factsById) {
            let fact = factsById[id]

            let index = this.props.corpus.facts.indexOf(fact)

            if (index < 0) {
                index = 99999
            }

            sortedFacts.push({
                index: index,
                fact: fact
            })
        }

        sortedFacts = sortedFacts.sort((f1, f2) => f1.index - f2.index)

        let factIndexToElement = (factIndex : FactIndex) => 
            <li key={ factIndex.fact.getId() } className='clickable' onClick={ () => openFact(factIndex.fact, this.props.corpus, this.props.tab) }>

                <div className={ 'index' + (factIndex.index == MISSING_INDEX ? ' missing' : '') }>
                    <div className='number' >
                        { factIndex.index == MISSING_INDEX ? 'n/a' : factIndex.index + 1 }
                    </div>
                </div>

                <FactNameComponent fact={ factIndex.fact } index={ factIndex.index } corpus={ this.props.corpus} />
            </li>

        let editor: SentenceEditorComponent
        let wordSearch: WordSearchComponent

        return (<div className='sentenceTab'>
            <div className='buttonBar right'>
                <div className='button' onClick={ () => this.duplicate() }>Duplicate</div>
                <div className='button' onClick={ () => this.delete() }>Delete</div>                
            </div>
            <div className='buttonBar'>
                {
                    Words.PUNCTUATION.split('').map((char) => 
                        <div className='button' key={ char } onClick={ () => editor.setWord(
                            this.props.corpus.words.get(char)
                        ) }>{ char }</div>
                    ) 
                }
            </div>

            <SentenceEditorComponent
                corpus={ this.props.corpus } 
                words={ this.props.sentence.words }
                onWordSelect={ (word: Word) => {
                    if (word instanceof InflectedWord) {
                        wordSearch.setWord(word.word) 
                    }
                    else if (word instanceof UnparsedWord) {
                        wordSearch.setFilterString(word.jp)
                    }
                    else {
                        wordSearch.clearFilters()
                    }
                } }
                ref={ (ref) => { editor = ref } }
                onSentenceChange={ (words: Word[]) => {
                    let sentence = this.props.corpus.sentences.get(this.state.sentence.id)

                    sentence.words = words

                    this.setState({ sentence: sentence })

                    this.props.corpus.sentences.store(sentence)
                } }/>

            <WordSearchComponent
                corpus={ this.props.corpus } 
                tab={ this.props.tab } 
                onWordSelect={ (word) => { editor.setWord(word); wordSearch.clearFilters() } } 
                ref={ (ref) => { wordSearch = ref } }
                canFilterWord={ true }/>

            <SentenceStatusComponent
                corpus={ this.props.corpus }
                sentence={ this.props.sentence }
                />

            <h3 className='openClose' onClick={ () => this.setState({ factsOpen: !this.state.factsOpen }) }>
            
                <svg viewBox='0 0 100 100'>
                    { this.state.factsOpen ?
                        <polygon points="0,0 100,0 50,100"/>
                        :
                        <polygon points="0,0 0,100 100,50"/>
                    }
                </svg>

                Facts
            </h3>

            { this.state.factsOpen ?
                <ul className='sortedFacts'>
                {
                    sortedFacts.map(factIndexToElement)
                }
                </ul>
                :
                <div/>
            }

            <h3 className='openClose' onClick={ () => this.setState({ phrasesOpen: !this.state.phrasesOpen }) }>
            
                <svg viewBox='0 0 100 100'>
                    { this.state.phrasesOpen ?
                        <polygon points="0,0 100,0 50,100"/>
                        :
                        <polygon points="0,0 0,100 100,50"/>
                    }
                </svg>

                Phrases
            </h3>

            { this.state.phrasesOpen ?
                <SentencePhrasesComponent
                    corpus={ this.props.corpus }
                    sentence={ this.props.sentence }
                    tab={ this.props.tab }
                />
                :
                <div/>
            }

            <SentenceTranslationComponent
                corpus={ this.props.corpus }
                sentence={ this.props.sentence }
                />

            <SentenceHistoryComponent 
                corpus={ this.props.corpus }
                sentence={ this.props.sentence }
                />
        </div>)
    }
}
