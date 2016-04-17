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
        }
    }
        
    setWord(word: Word) {
        this.setState({ filterWord: word, filterPos: null, filterForm: null })
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

                if (this.state.filterString && fact instanceof Word) {
                    if (fact.toString().substr(0, this.state.filterString.length) !== this.state.filterString) {
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
                    let suggestion: Suggestion = {
                        index: this.props.corpus.facts.indexOf(fact),
                        word: fact,
                        fact: fact,
                        inflection: null
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

        let factIndexToElement = (suggestion : Suggestion) => 
            <div key={ suggestion.word.getId() } 
                draggable={ suggestion.inflection || !(suggestion.word instanceof InflectedWord)} 
                className='suggestion'
                onClick={ () => {
                    let word = suggestion.word
                    
                    if (!suggestion.inflection && word instanceof InflectedWord) {
                        this.setState({ filterWord: word.infinitive })
                    } 
                    else {
                        this.props.onWordSelect(suggestion.word) 
                    }
                } } 
                onDragStart={ (e) => {
                    e.dataTransfer.setData('text', JSON.stringify( { word: suggestion.word.getId() } ));
                } }>
                <div className='word'>{suggestion.word.toString()}</div>
                { suggestion.inflection ?
                    <div className='form'>{suggestion.inflection.form }</div>
                    :
                    []
                }
                <div className='count'>{ getFactOccurrences(suggestion.fact) }</div>
                { suggestion.inflection ?
                    <div className='count'>{ getFactOccurrences(suggestion.inflection.fact) }</div>
                    :
                    []
                }
            </div>

        return (<div>
            <div>
                <input onChange={ (event) => {
                    this.setState({
                        filterString: event.target.value,
                        filterWord: null
                    })
                } }/>
            </div>
        
            <div className='filter'>
            {
                this.props.corpus.inflections.getAllPos().concat(NO_POS).map((pos: string) => {
                    return <div key={pos} onClick={ () => 
                        this.setState({ filterPos: pos, filterForm: null, filterWord: null })
                    } className='option'>{pos}</div>
                })
            }
            </div>

            <div className='filter'>
            {
                Array.from(allForms).map((form: string) => {
                    return <div key={form} onClick={ () => 
                        this.setState({ filterForm: form })
                    } className='option'>{ form }</div>
                })
            }
            </div>
            

            <div className='suggestions'>
            {
                suggestions.map(factIndexToElement)
            }
            </div>
        </div>)
    }
}
