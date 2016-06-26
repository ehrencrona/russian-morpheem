/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus';
import Fact from '../shared/Fact';
import UnstudiedWord from '../shared/UnstudiedWord';
import InflectedWord from '../shared/InflectedWord';
import InflectableWord from '../shared/InflectableWord';
import Tab from './Tab'
import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'
import InflectionsComponent from './InflectionsComponent';

import { Component, createElement } from 'react';

let NO_POS = 'none'

interface Props {
    corpus: Corpus,
    tab: Tab,
    onWordSelect: (Word) => any,
    canFilterWord?: boolean
}

interface State {
    filterPos?: string,
    filterString?: string,
    filterWord?: InflectableWord
}

let React = { createElement: createElement }

interface Inflection {
    fact: Fact,
    form: string
}

interface Suggestion {
    index: number,
    word: UnstudiedWord,
    fact: Fact,
    inflection: Inflection
}

export default class WordSearchComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
        
        this.state = {
            filterString: ''
        }
    }

    clearFilters() {
        this.setState({ filterWord: null, filterString: '', filterPos: null })
    }
    
    setWord(word: InflectableWord) {
        this.setState({ filterWord: word, filterPos: null })
    }

    selectSuggestion(suggestion: Suggestion) {
        let word = suggestion.word

        if (!suggestion.inflection && word instanceof InflectedWord && this.props.canFilterWord) {
            this.setState({ filterWord: word.word })
        } 
        else {
            this.props.onWordSelect(suggestion.word)
            this.setState({ filterWord: null, filterString: '' })
        }
    }

    findMatchingInflections(word: InflectableWord, filter: string): Suggestion[] {
        let exactMatches: UnstudiedWord[] = []
        let prefixMatch: InflectedWord
        let prefixIsDefault

        let i = Math.min(filter.length, word.stem.length)

        word.visitAllInflections((inflected: InflectedWord) => {
            if (inflected.jp == filter) {
                exactMatches.push(inflected)
            }
            else if (inflected.jp.substr(0, filter.length).toLowerCase() == filter && !prefixIsDefault) {
                prefixMatch = inflected
                prefixIsDefault = inflected === word.getDefaultInflection()
            }
        }, false)

        if (!exactMatches.length && prefixMatch) {
            if (prefixIsDefault) {
                return [ this.inflectableWordToSuggestion(word) ]
            }
            else {
                return [ this.wordToSuggestion(prefixMatch) ]
            }
        }
        else {
            return exactMatches.map((word) => this.wordToSuggestion(word))
        }
    }
    
    wordToSuggestion(word: UnstudiedWord): Suggestion {
        let inflection
        let index
        let fact: Fact

        if (word instanceof InflectedWord) {
            let inflectionFact = word.word.inflection.getFact(word.form)

            inflection = {
                form: word.form,
                fact: inflectionFact
            }

            index = this.props.corpus.facts.indexOf(word.word)
            fact = word.word
        }
        else {
            index = this.props.corpus.facts.indexOf(word)
            fact = word
        }

        return {
            index: index,
            word: word,
            fact: fact,
            inflection: inflection
        }
    } 
    
    inflectableWordToSuggestion(word: InflectableWord): Suggestion {
        let index = this.props.corpus.facts.indexOf(word)
        let fact: Fact

        return {
            index: index,
            word: word.getDefaultInflection(),
            fact: word,
            inflection: null
        }
    } 
           
    wordsMatchingFilterString(fact, filter: string): Suggestion[] {
        if (fact instanceof UnstudiedWord && 
            fact.jp.substr(0, filter.length).toLowerCase() == filter) {
            return [ this.wordToSuggestion(fact) ]
        }
        
        if (fact instanceof InflectableWord) {
            return this.findMatchingInflections(fact, filter)
        }

        return []
    }
    
    render() {
        let index : { [factId: string]: FactSentenceIndex } = 
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        let allForms = new Set<string>()

        let filterPos = this.state.filterPos
        let filterString = this.state.filterString.toLowerCase()
        let corpus = this.props.corpus

        function getFactOccurrences(fact: Fact) {
            let fi = index[fact.getId()]
            
            if (!fi) {
                return 0
            }
            
            return fi.easy + fi.ok + fi.hard
        } 
        
        let facts = this.props.corpus.facts
        
        let getSuggestions = () => {
            let suggestions: Suggestion[] = []

            if (!filterPos && !filterString) {
                return suggestions
            }

            let filterFact = (filterString) => (fact: Fact) => {
                if (filterPos) {
                    if (fact instanceof InflectableWord) {
                        if (!(fact.inflection.pos == filterPos || 
                             (filterPos == NO_POS && !fact.inflection.pos))) {
                            return
                        }
                    }
                    else if (!(filterPos == NO_POS && fact instanceof UnstudiedWord)) {
                        return
                    }
                }

                if (this.state.filterWord) {
                    if (fact instanceof InflectableWord && this.state.filterWord.getId() == fact.getId()) {                            
                        fact.visitAllInflections((inflected: InflectedWord) => {
                            suggestions.push(this.wordToSuggestion(inflected))
                        }, false)
                    }
                }
                else if (filterString) {
                    suggestions = suggestions.concat(this.wordsMatchingFilterString(fact, filterString)) 
                }
                else if (fact instanceof UnstudiedWord) {
                    suggestions.push(this.wordToSuggestion(fact))
                }
                else if (fact instanceof InflectableWord) {
                    suggestions.push(this.inflectableWordToSuggestion(fact))
                }
            }

            if (filterString && !filterPos && !this.state.filterWord) {
console.log('wordsStartingWith')
                suggestions = this.props.corpus.words.wordsStartingWith(filterString)
                    .map((word) => this.wordToSuggestion(word))
            }
            else {
                this.props.corpus.facts.facts.forEach(filterFact(filterString))
            }

            if (!suggestions.length) {
                let searchWords = this.state.filterString.toLowerCase().split(/[ ,.!\?]/)

                if (searchWords.length > 1) {
                    searchWords.forEach((word) => {
                        word = word.trim()

                        if (word) {
                            this.props.corpus.facts.facts.forEach(filterFact(word))
                        }
                    })
                }
            }

            this.props.corpus.words.getPunctuationWords().forEach(filterFact(filterString))

            if (filterString) {
                let i = suggestions.findIndex((s) => s.word.jp.toLowerCase() == filterString)

                if (i >= 0) {
                    let exactMatch = suggestions.splice(i, 1)[0]
                    
                    suggestions.splice(0, 0, exactMatch)
                }
            }
            
            return suggestions
        }

        let factIndexToElement = (suggestion : Suggestion) => {
            let index = this.props.corpus.facts.indexOf(suggestion.word)
            
            if (suggestion.inflection) {
                index = Math.max(index,
                    this.props.corpus.facts.indexOf(suggestion.inflection.fact)
                ) 
            } 

            let onClick = () => {
                this.selectSuggestion(suggestion)
            }

            return <div key={ suggestion.word.getId() } 
                draggable={ !!(suggestion.inflection || !(suggestion.word instanceof InflectedWord)) } 
                className='suggestion'
                onClick={ onClick } 
                onDragStart={ (e) => {
                    e.dataTransfer.setData('text', JSON.stringify( { word: suggestion.word.getId() } ));
                } }
                onDrop={
                    (e) => {
                        let drag = JSON.parse(e.dataTransfer.getData('text'))
                        
                        if (drag.word == suggestion.word.getId()) {
                            onClick()
                        }
                    }
                }>
                { (suggestion.index >= 0 ?
                    <div className='index'><div className='number'>{ suggestion.index + 1 }</div></div>
                    :
                    <div/>) }
                <div className='word'>{ suggestion.word.jp }</div>
                { suggestion.inflection ?
                    <div className='form'>{suggestion.inflection.form }</div>
                    :
                    []
                }
            </div>
        }
        
        let filterWord = this.state.filterWord
        
        let suggestions = getSuggestions()
    
        return (<div className='wordSearch'>
            <div className='filter'>
                <input type='text' autoCapitalize='off' value={ this.state.filterString } onChange={ (event) => {
                    let target = event.target

                    if (target instanceof HTMLInputElement) {
                        this.setState({
                            filterString: target.value,
                            filterWord: null
                        })
                    }
                }}
                
                onKeyPress={
                    (event) => {
                        if (event.charCode == 13 && suggestions.length) {
                            this.selectSuggestion(suggestions[0])
                        }
                    }
                }/>
            </div>
        
            <div className='filter'>
            {
                this.props.corpus.inflections.getAllPos().concat(NO_POS).map((pos: string) => {
                    return <div key={pos} onClick={ () => 
                        this.setState({ filterPos: (pos == this.state.filterPos ? null : pos), 
                            filterWord: null })
                    } className={ 'option' + (pos == this.state.filterPos ? ' active' : '') }>{pos}</div>
                })
            }
            </div>

            <div className='suggestions'>

            {
                (filterWord && filterWord instanceof InflectableWord ?
                <div>
                    <div className='inflections'>
                        <div className='inflectionName'>
                            { filterWord.inflection.id + (filterWord.inflection.pos ? ' (' + filterWord.inflection.pos + ')' : '') } 
                        </div>
                    </div>

                    <InflectionsComponent 
                        corpus={ this.props.corpus }
                        tab={ this.props.tab }
                        inflection={ filterWord.inflection }
                        word={ filterWord }
                        onSelect={ (word) => {
                            this.props.onWordSelect(word)
                            this.setState({ filterWord: null, filterString: '' })
                        } }
                        />
                </div>
                
                :
                
                suggestions.map(factIndexToElement)

                )
            }
            </div>
        </div>)
    }
}
