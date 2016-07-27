/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import Tab from '../OpenTab'
import SentenceComponent from '../SentenceComponent'
import PhrasePattern from '../../shared/phrase/PhrasePattern'
import PhraseSentencesComponent from '../phrase/PhraseSentencesComponent'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {

    pattern?: PhrasePattern,
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
            let pattern = PhrasePattern.fromString(str, '', this.props.corpus.words, this.props.corpus.inflections)

            this.setState({ pattern: pattern })
        }
        catch (e) {
            this.setState({ error: e.toString(), pattern: null })
        }
    }

    render() {
        console.log('lang',this.props.corpus.lang)
        return (
            <div className='searchSentences'>
                <input type='text' lang={ this.props.corpus.lang } autoCapitalize='off' onChange={ (e) => {
                    this.search((e.target as HTMLInputElement).value)
                }}/>

                {
                    this.state.pattern ?

                        <PhraseSentencesComponent 
                            corpus={ this.props.corpus }
                            patterns={ [ this.state.pattern ] }
                            tab={ this.props.tab }
                            />

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