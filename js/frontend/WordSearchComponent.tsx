/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus';
import Fact from '../shared/Fact';
import Word from '../shared/Word';
import InflectedWord from '../shared/InflectedWord';
import { Tab } from './TabSetComponent'
import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'

import { Component, createElement } from 'react';

const NO_POS = 'none'

interface Props {
    corpus: Corpus,
    tab: Tab,
    onWordSelect: (Word) => any
}

interface State {
    filterForm?: string,
    filterPos?: string,
    filterString?: string,
    filterWord?: Word
}

let React = { createElement: createElement }

interface Inflection {
    index: number,
    fact: Fact,
    form: string
}

interface Suggestion {
    index: number,
    word: Word,
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
        
    setWord(word: Word) {
        this.setState({ filterWord: word, filterPos: null, filterForm: null })
    }

    clearFilters() {
        this.setState({ filterWord: null, filterString: '', filterForm: null, filterPos: null })
    }
    
    selectSuggestion(suggestion: Suggestion) {
        let word = suggestion.word

        if (!suggestion.inflection && word instanceof InflectedWord) {
            this.setState({ filterWord: word.infinitive })
        } 
        else {
            this.props.onWordSelect(suggestion.word)
            this.setState({ filterWord: null, filterString: '' })
        }
    }
    
    findMatchingInflection(word: InflectedWord, filter: string) {
        let i = Math.min(filter.length, word.stem.length)

        if (word.stem.substr(0, i) == filter.substr(0, i)) {
            let found
            
            word.visitAllInflections((inflection: InflectedWord) => {
                if (inflection.toString().substr(0, filter.length) == filter) {
                    found = inflection
                }
            }, false)
            
            return found
        }
    }
    
    factMatchingFilterString(fact, filter: string) {
        if (fact instanceof Word && 
            fact.toString().substr(0, filter.length) == filter) {
            return fact
        }
        
        if (fact instanceof InflectedWord) {
            return this.findMatchingInflection(fact, filter)
        }
    }
    
    render() {
        let index : { [factId: string]: FactSentenceIndex } = 
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        let suggestions: Suggestion[] = []
        let allForms = new Set<string>()

        if (this.state.filterPos || this.state.filterString || this.state.filterWord) {
            let filterPos = this.state.filterPos

            this.props.corpus.facts.facts.forEach((fact: Fact) => {
                if (this.state.filterWord && fact instanceof Word && this.state.filterWord.getId() != fact.getId()) {
                    return
                }

                let filterString = this.state.filterString
                
                if (filterString) {
                    fact = this.factMatchingFilterString(fact, filterString)
                    
                    if (!fact) {
                        return
                    }
                }
                
                if (fact instanceof InflectedWord && this.state.filterWord) {
                    fact.visitAllInflections((inflected: InflectedWord) => {
                        if (this.state.filterForm && this.state.filterForm != inflected.form) {
                            return
                        }
                        
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

                    Object.keys(fact.inflection.endings)
                        .forEach((form) => allForms.add(form))
                } 
                else if (fact instanceof InflectedWord && 
                        (fact.inflection.pos == filterPos || (filterPos == NO_POS && !fact.inflection.pos) || !filterPos)) {
                    let addFact = fact
                    
                    let inflection = null
                      
                    if (fact.form != fact.inflection.defaultForm) {
                        let inflectionFact = fact.inflection.getFact(fact.form)
                        
                        inflection = {
                            form: fact.form,
                            fact: inflectionFact,
                            index: this.props.corpus.facts.indexOf(inflectionFact)
                        }
                    }
                    
                    let suggestion: Suggestion = {
                        index: this.props.corpus.facts.indexOf(fact),
                        word: fact,
                        fact: fact,
                        inflection: inflection
                    }
                    
                    let filterForm = this.state.filterForm
                    
                    if (filterForm) {
                        if (!fact.inflection.hasForm(filterForm)) {
                            return
                        }
                        
                        let formFact = fact.inflection.getFact(filterForm)
                        
                        suggestion.word = fact.inflect(filterForm)
                        suggestion.fact = fact.infinitive
                        suggestion.inflection = {
                            form: filterForm,
                            fact: formFact,
                            index: this.props.corpus.facts.indexOf(formFact)
                        }
                    }
                    
                    suggestions.push(suggestion)

                    Object.keys(fact.inflection.endings)
                        .forEach((form) => allForms.add(form))
                }
                else if (fact instanceof Word && !(fact instanceof InflectedWord) &&
                        (!filterPos || filterPos == NO_POS)) {
                    suggestions.push({
                        index: -1,
                        word: fact,
                        fact: fact,
                        inflection: null
                    })
                }
            })
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
            
            return <div key={ suggestion.word.getId() } 
                draggable={ !!(suggestion.inflection || !(suggestion.word instanceof InflectedWord)) } 
                className='suggestion'
                onClick={ () => {
                    this.selectSuggestion(suggestion)
                } } 
                onDragStart={ (e) => {
                    e.dataTransfer.setData('text', JSON.stringify( { word: suggestion.word.getId() } ));
                } }>
                { (index >= 0 ?
                    <div className='index'><div className='number'>{ index + 1 }</div></div>
                    :
                    <div/>) }
                <div className='word'>{suggestion.word.toString()}</div>
                <div className='count'>{ getFactOccurrences(suggestion.fact) }</div>
                { suggestion.inflection ?
                    <div className='form'>{suggestion.inflection.form }</div>
                    :
                    []
                }
                { suggestion.inflection ?
                    <div className='count'>{ getFactOccurrences(suggestion.inflection.fact) }</div>
                    :
                    []
                }
            </div>
        }
        
        return (<div className='wordSearch'>
            <div className='filter'>
                <input type='text' value={ this.state.filterString } onChange={ (event) => {
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
                            filterForm: null, filterWord: null })
                    } className={ 'option' + (pos == this.state.filterPos ? ' active' : '') }>{pos}</div>
                })
            }
            </div>

            { (allForms.size > 0 ? 

                <div className='filter'>
                {
                    Array.from(allForms).map((form: string) => {
                        return <div key={form} onClick={ () => 
                            this.setState({ filterForm: (form == this.state.filterForm ? null : form) })
                        } className={'option' + (form == this.state.filterForm ? ' active' : '') }>{ form }</div>
                    })
                }
                </div>
                
                :
                
                <div/>
                
            ) }
            

            <div className='suggestions'>
            {
                suggestions.map(factIndexToElement)
            }
            </div>
        </div>)
    }
}
