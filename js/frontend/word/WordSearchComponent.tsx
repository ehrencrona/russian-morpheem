import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import UnparsedWord from '../../shared/UnparsedWord'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import AnyWord from '../../shared/AnyWord'
import { POSES } from '../../shared/inflection/InflectionForms'
import { PartOfSpeech as PoS } from '../../shared/inflection/Dimensions'
import Tab from '../OpenTab'
import InflectionsContainerComponent from '../inflection/InflectionsContainerComponent';

import { Component, createElement } from 'react';

let NO_POS = 'none'
const MAX_SUGGESTIONS = 50

interface Props {
    corpus: Corpus,
    tab: Tab,
    onWordSelect: (Word) => any,
    canFilterWord?: boolean
}

interface State {
    filterPos?: PoS,
    filterString?: string,
    filterWord?: InflectableWord
}

interface Inflection {
    fact: Fact,
    form: string
}

interface Suggestion {
    index: number,
    word: Word,
    fact: Fact,
    inflection: Inflection
}

let React = { createElement: createElement }

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
        this.setState({ filterWord: word, filterPos: null, filterString: '' })
    }

    setFilterString(string: string) {
        this.setState({ filterString: string, filterWord: null, filterPos: null })
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
        let exactMatches: Word[] = []
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
        })

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
    
    wordToSuggestion(word: Word): Suggestion {
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

    wordsMatchingFilterString(fact: Fact, filter: string): Suggestion[] {
        if (fact instanceof Word) {
            if (fact.jp.substr(0, filter.length).toLowerCase() == filter ||
                fact.getEnglish().indexOf(filter) >= 0) {
                return [ this.wordToSuggestion(fact) ]
            }
        }
        else if (fact instanceof InflectableWord) {
            if (fact.getEnglish().indexOf(filter) >= 0) {
                return [ this.inflectableWordToSuggestion(fact) ]
            }
            else {
                return this.findMatchingInflections(fact, filter)
            }
        }

        return []
    }

    getSuggestions() {
        let filterPos = this.state.filterPos
        let filterString = this.state.filterString.toLowerCase()

        let suggestions: Suggestion[] = []

        if (!filterPos && !filterString) {
            return suggestions
        }

        let filterFact = (filterString) => (fact: Fact) => {
            if (filterPos) {
                if (fact instanceof Word || fact instanceof InflectableWord) {
                    if (!(fact.wordForm.pos == filterPos || 
                        (!filterPos && !fact.wordForm.pos))) {
                        return
                    }
                }
                else if (!(filterPos && fact instanceof Word)) {
                    return
                }
            }

            if (this.state.filterWord) {
                if (fact instanceof InflectableWord && this.state.filterWord.getId() == fact.getId()) {                            
                    fact.visitAllInflections((inflected: InflectedWord) => {
                        suggestions.push(this.wordToSuggestion(inflected))
                    })
                }
            }
            else if (filterString) {
                suggestions = suggestions.concat(this.wordsMatchingFilterString(fact, filterString)) 
            }
            else if (fact instanceof Word) {
                suggestions.push(this.wordToSuggestion(fact))
            }
            else if (fact instanceof InflectableWord) {
                suggestions.push(this.inflectableWordToSuggestion(fact))
            }
        }

        if (filterString && !filterString.match(/[a-zA-Z]/) && !filterPos && !this.state.filterWord) {
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

    factIndexToElement(suggestion : Suggestion) {
        let index = this.props.corpus.facts.indexOf(suggestion.word)
        
        if (suggestion.inflection) {
            index = Math.max(index,
                this.props.corpus.facts.indexOf(suggestion.inflection.fact)
            ) 
        } 

        let onClick = () => {
            this.selectSuggestion(suggestion)
        }

        let disambiguation = suggestion.word.getDisambiguation(this.props.corpus.words)

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
            { disambiguation ?
                <div className='form'>{ disambiguation }</div>
                :
                []
            }
        </div>
    }

    getAlternatives(word: InflectableWord): (Word|InflectableWord)[] {
        let thisId = word.getIdWithoutClassifier()

        let ids = {}

        ids[word.getId()] = word

        let result: (Word|InflectableWord)[] = []

        let found = (fact: Word | InflectableWord) => {
            let stem = fact

            if (fact instanceof InflectedWord) {
                stem = fact.word
            }

            if (ids[stem.getId()]) {
                return
            }

            ids[stem.getId()] = stem
            result.push(stem)
        }

        this.props.corpus.facts.facts.forEach((fact) => { 
            if ((fact instanceof Word || fact instanceof InflectableWord) && fact.getIdWithoutClassifier() == thisId) {
                found(fact)
            }
        })

        word.visitAllInflections((inflection) => {

            let ambiguous = this.props.corpus.words.ambiguousForms[inflection.toString()]

            if (ambiguous) {
                ambiguous.forEach((word) => {
                    found(word)
                })
            }

        })

        return result
    }

    focus() {
        (this.refs['input'] as HTMLInputElement).focus()
    }

    render() {
        let allForms = new Set<string>()

        let filterPos = this.state.filterPos
        let filterString = this.state.filterString.toLowerCase()
        let corpus = this.props.corpus
        
        let facts = this.props.corpus.facts
        
        let filterWord = this.state.filterWord
        
        let suggestions = this.getSuggestions().slice(0, MAX_SUGGESTIONS)

        let alternatives

        if (filterWord) {
            alternatives = this.getAlternatives(filterWord)
        }

        return (<div className='wordSearch'>
            <div className='filter'>
                <input type='text' lang={ this.props.corpus.lang } autoCapitalize='off' 
                        ref='input'
                        value={ this.state.filterString } onChange={ (event) => {
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

                        if (event.charCode == 13) {
                            let wordString = this.state.filterString.trim()

                            if (!wordString || !suggestions.length) {
                                return
                            }

                            let firstInexact = suggestions.findIndex((suggestion) => suggestion.word.jp != wordString)

                            if (firstInexact < 0 || firstInexact == 1 || suggestions.length == 1) {
                                this.selectSuggestion(suggestions[0])
                            }
                            else if (wordString) {
                                this.props.onWordSelect(new UnparsedWord(wordString))
                                this.setState({ filterWord: null, filterString: '' })
                            }
                        }
                    }
                }/>
            </div>
        
            <div className='filter'>
            {
                Object.keys(POSES).map((posStr: string) => {
                    let pos = parseInt(posStr) as PoS

                    return <div key={pos} onClick={ () => 
                        this.setState({ filterPos: (pos == this.state.filterPos ? null : pos), 
                            filterWord: null })
                    } className={ 'option' + (pos == this.state.filterPos ? ' active' : '') }>{pos}</div>
                })
            }
            </div>

            <div className='suggestions'>

            {
                filterWord ?
                <div>
                    { alternatives && alternatives.length ?
                        <div className='alternatives'>
                            This means&nbsp;"<b>{ filterWord.getEnglish() }</b>". Similar words:                         

                            <ul>
                                {
                                    alternatives.map((word: InflectableWord | Word) => 
                                        <li key={ word.getId() } onClick={ () => { 
                                            if (word instanceof InflectableWord) {
                                                this.setState({ filterWord: word }) 
                                            }
                                            else {
                                                this.props.onWordSelect(word)
                                            }
                                        } }>{ (word instanceof InflectableWord ? word.getDefaultInflection().jp : word.jp) + 
                                            ' (' + word.getEnglish() + ')' }</li>
                                    )
                                }
                            </ul>
                        </div>

                        : 
                        <div/>
                    }

                    <InflectionsContainerComponent 
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
                
                suggestions.map((suggestion) => this.factIndexToElement(suggestion))
            }
            </div>
        </div>)
    }
}
