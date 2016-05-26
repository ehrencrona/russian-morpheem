/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus';
import Fact from '../shared/Fact';
import UnstudiedWord from '../shared/UnstudiedWord';
import InflectedWord from '../shared/InflectedWord';
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
    filterWord?: UnstudiedWord
}

let React = { createElement: createElement }

interface Inflection {
    index: number,
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
    
    setWord(word: UnstudiedWord) {
        this.setState({ filterWord: word, filterPos: null })
    }

    selectSuggestion(suggestion: Suggestion) {
        let word = suggestion.word

        if (!suggestion.inflection && word instanceof InflectedWord && this.props.canFilterWord) {
            this.setState({ filterWord: word.infinitive })
        } 
        else {
            this.props.onWordSelect(suggestion.word)
            this.setState({ filterWord: null, filterString: '' })
        }
    }
    
    findMatchingInflections(word: InflectedWord, filter: string): Fact[] {
        let i = Math.min(filter.length, word.stem.length)

        let result: Fact[] = []
        let prefixMatch: InflectedWord

        if (word.stem.substr(0, i) == filter.substr(0, i)) {
            word.visitAllInflections((inflection: InflectedWord) => {
                if (inflection.toString() == filter) {
                    result.push(inflection)
                }
                else if (inflection.toString().substr(0, filter.length) == filter) {
                    prefixMatch = inflection
                }
            }, false)
        }
        
        if (result.length && prefixMatch) {
            result.push(prefixMatch)
        }
        
        return result
    }
    
    factsMatchingFilterString(fact, filter: string): Fact[] {
        if (fact instanceof UnstudiedWord && 
            fact.toString().substr(0, filter.length) == filter) {
            return [ fact ]
        }

        if (fact instanceof InflectedWord) {
            return this.findMatchingInflections(fact, filter)
        }
        
        return []
    }
    
    render() {
        let index : { [factId: string]: FactSentenceIndex } = 
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        let suggestions: Suggestion[] = []
        let allForms = new Set<string>()

        let filterPos = this.state.filterPos
        let filterString = this.state.filterString
        let corpus = this.props.corpus

        function addSuggestionForFact(fact: Fact) {
            if (fact instanceof InflectedWord && 
                    (fact.inflection.pos == filterPos || (filterPos == NO_POS && !fact.inflection.pos) || !filterPos)) {
                let addFact = fact
                
                let inflection = null
                    
                if (fact.form != fact.inflection.defaultForm) {
                    let inflectionFact = fact.inflection.getFact(fact.form)
                    
                    inflection = {
                        form: fact.form,
                        fact: inflectionFact,
                        index: corpus.facts.indexOf(inflectionFact)
                    }
                }
                
                let suggestion: Suggestion = {
                    index: corpus.facts.indexOf(fact),
                    word: fact,
                    fact: fact,
                    inflection: inflection
                }
                
                suggestions.push(suggestion)

                Object.keys(fact.inflection.endings)
                    .forEach((form) => allForms.add(form))
            }
            else if (fact instanceof UnstudiedWord && !(fact instanceof InflectedWord) &&
                    (!filterPos || filterPos == NO_POS)) {
                suggestions.push({
                    index: -1,
                    word: fact,
                    fact: fact,
                    inflection: null
                })
            }
        }

        if (filterPos || filterString || this.state.filterWord) {
            this.props.corpus.facts.facts.forEach((fact: Fact) => {
                if (this.state.filterWord) {
                    if (fact instanceof UnstudiedWord && this.state.filterWord.getId() == fact.getId()) {
                        if (fact instanceof InflectedWord) {                            
                            fact.visitAllInflections((inflected: InflectedWord) => {
                                let inflectionFact = fact.inflection.getFact(inflected.form)
                                
                                let suggestion: Suggestion = {
                                    index: this.props.corpus.facts.indexOf(fact),
                                    word: inflected,
                                    fact: fact,
                                    inflection: {
                                        form: inflected.form,
                                        fact: inflectionFact,
                                        index: this.props.corpus.facts.indexOf(inflectionFact)
                                    }
                                }
                                
                                suggestions.push(suggestion)
                            }, false)
                        }
                        else {
                            addSuggestionForFact(fact)
                        }
                    }
                }
                else if (filterString) {
                    this.factsMatchingFilterString(fact, filterString)
                        .forEach(addSuggestionForFact)
                }
                else {
                    addSuggestionForFact(fact)
                }
            })

            if (filterString) {
                let i = suggestions.findIndex((s) => s.fact.toString() == filterString)
                
                if (i >= 0) {
                    let exactMatch = suggestions.splice(i, 1)[0]
                    
                    suggestions.splice(0, 0, exactMatch)
                }
            }
        }

        function getFactOccurrences(fact: Fact) {
            let fi = index[fact.getId()]
            
            if (!fi) {
                return 0
            }
            
            return fi.easy + fi.ok + fi.hard
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
                { (index >= 0 ?
                    <div className='index'><div className='number'>{ index + 1 }</div></div>
                    :
                    <div/>) }
                <div className='word'>{suggestion.word.toString()}</div>
                { suggestion.inflection ?
                    <div className='form'>{suggestion.inflection.form }</div>
                    :
                    []
                }
            </div>
        }
        
        let filterWord = this.state.filterWord
        
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
                (filterWord && filterWord instanceof InflectedWord ?
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
