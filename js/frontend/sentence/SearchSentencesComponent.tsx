

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Tab from '../OpenTab'
import SentenceComponent from './SentenceComponent'
import PhrasePattern from '../../shared/phrase/PhrasePattern'
import Phrase from '../../shared/phrase/Phrase'
import PhraseSentencesComponent from '../phrase/PhraseSentencesComponent'
import SentenceIdSearchComponent from './SentenceIdSearchComponent'
import isConflictFunction from '../phrase/isConflict'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {

    id?: number,
    pattern?: PhrasePattern,
    onlyNonPhrase?: boolean,
    error?: string

}

let React = { createElement: createElement }

export default class SentencesComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
        }
    }

    search(str: string) {
        try {
            if (parseInt(str)) {
                this.setState({ pattern: null, id: parseInt(str) })
            }
            else {
                let pattern = PhrasePattern.fromString(str, '', this.props.corpus.words, this.props.corpus.inflections)

                this.setState({ pattern: pattern, id: null })
            }
        }
        catch (e) {
            this.setState({ error: e.toString(), pattern: null, id: null })
        }
    }

    render() {
        let phrase = new Phrase('search', this.state.pattern ? [ this.state.pattern ] : [])
        phrase.setCorpus(this.props.corpus)

        return (
            <div className='searchSentences'>
                <input type='text' lang={ this.props.corpus.lang } autoCapitalize='off' onChange={ (e) => {
                    this.search((e.target as HTMLInputElement).value)
                }}/>

                <div className='filter'>
                    <input type='checkbox' defaultChecked={ this.state.onlyNonPhrase } 
                        onChange={ (e) => {
                            this.setState({ onlyNonPhrase: (e.target as HTMLInputElement).checked })
                        } }
                        id='onlyNonPhrase'/> 

                    <label htmlFor='onlyNonPhrase'>
                        Only matches that are not part of a phrase
                    </label>
                </div>

                {
                    this.state.id ? 
                        <SentenceIdSearchComponent
                            corpus={ this.props.corpus }
                            tab={ this.props.tab }
                            id={ this.state.id } />
                        
                        :

                        (
                            this.state.pattern ?

                                <PhraseSentencesComponent 
                                    corpus={ this.props.corpus }
                                    patterns={ [ this.state.pattern ] }
                                    tab={ this.props.tab }
                                    limit={ 200 }
                                    includeConflicts={ !this.state.onlyNonPhrase }
                                    isConflict={ (this.state.onlyNonPhrase ?
                                        (sentence: Sentence, wordIndexes: number[]) => 
                                            isConflictFunction(phrase, this.props.corpus)(sentence, wordIndexes) :
                                        null) }
                                    />

                            :

                            (
                                this.state.error ?

                                    <div className='error'>{ this.state.error }</div>

                                :

                                <div/>
                            )
                        )                    
                }
            </div>)
    }
}