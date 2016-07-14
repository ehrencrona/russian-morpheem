/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Tab from '../Tab'
import SentenceComponent from '../SentenceComponent'
import PhraseMatch from '../../shared/phrase/PhraseMatch'
import FindPhraseComponent from '../phrase/FindPhraseComponent'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {

    match?: PhraseMatch,
    error?: string

}

let React = { createElement: createElement }

export default class SentencesComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    search(str: string) {
        try {
            let match = PhraseMatch.fromString(str, this.props.corpus.words, this.props.corpus.inflections)

            this.setState({ match: match })
        }
        catch (e) {
            this.setState({ error: e.toString(), match: null })
        }
    }

    render() {        
        return (
            <div className='searchSentences'>
                <input type='text' onChange={ (e) => {
                    this.search((e.target as HTMLInputElement).value)
                }}/>

                {
                    this.state.match ?

                        <FindPhraseComponent 
                            corpus={ this.props.corpus }
                            match={ this.state.match }
                            tab={ this.props.tab }/>

                    :

                    (
                        this.state.error ?

                            <div className='error'>{ this.state.error }</div>

                        :

                        <div/>
                    )
                }
            </div>)
    }
}