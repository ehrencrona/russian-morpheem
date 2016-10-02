import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import { MISSING_INDEX } from '../shared/fact/Facts'
import Sentence from '../shared/Sentence'
import Word from '../shared/Word'
import { ExternalSentence } from '../shared/external/ExternalSentence'
import { parseSentenceToWords, ParsedWord } from '../shared/external/parseSentenceToWords'
import { Factoid } from '../shared/metadata/Factoids'

import { Component, createElement } from 'react';

import SentenceComponent from './SentenceComponent'
import Tab from './OpenTab'

interface Props {
    corpus: Corpus,
    fact: Fact,
    tab: Tab
}

interface State {
    factoid: Factoid
}

interface ParsedSentence {
    words: ParsedWord[],
    sentence: ExternalSentence,
    difficulty: number
}

let React = { createElement: createElement }

export default class FactoidComponent extends Component<Props, State> {
    componentDidMount() {
        this.props.corpus.factoids.getFactoid(this.props.fact).then((factoid) => {

            this.setState({
                factoid: factoid
            })

        })
    }

    render() {
        if (!this.state) {
            return <div/>
        }

        return (<div>
            <h3>Explanation</h3>

                <textarea className='factoid' defaultValue={ this.state.factoid.explanation } onBlur={ (e) => {
                    let explanation = (e.target as HTMLTextAreaElement).value

                    if (this.state.factoid.explanation != explanation) {
                        this.state.factoid.explanation = explanation

                        this.props.corpus.factoids.setFactoid(this.state.factoid, this.props.fact)
                    }
                } } />
            <div></div>
        </div>);
    }
}
