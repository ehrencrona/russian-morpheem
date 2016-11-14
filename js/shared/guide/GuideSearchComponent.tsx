
import { Component, createElement } from 'react'

import Corpus from '../Corpus'
import Fact from '../fact/Fact'
import Sentence from '../Sentence'
import AbstractAnyWord from '../AbstractAnyWord'
import renderRelatedFact from './fact/renderRelatedFact'

import doesFactMatchQuery from '../../frontend/fact/doesFactMatchQuery'
import Phrase from '../phrase/Phrase'
import getGuideUrl from './getGuideUrl'
import FORMS from '../inflection/InflectionForms'
import allGuideFacts from './allGuideFacts'
import { sawFact } from './lastSeenFact'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    xrArgs: { [arg: string] : string }
}

interface State {
    query: string
}

export default class GuideSearchComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {
            query: ''
        }
    }

    documentClickListener = () => this.setState({ query: '' })

    componentWillMount() {
        document.addEventListener('click', this.documentClickListener)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.documentClickListener)
    }

    render() {
        let facts = []
        let query = this.state.query

        if (query) {
            let corpus = this.props.corpus

            let factWeights = 
                allGuideFacts(this.props.corpus)
                .map(f => { return { fact: f, weight: doesFactMatchQuery(f, query) } })
                .filter(fw => fw.weight > 0)
                .sort((fw1, fw2) => fw2.weight - fw1.weight)
                .slice(0, 20)

            if (factWeights.length) {
                let cutoffWeight = factWeights[0].weight * 0.4

                factWeights = factWeights.filter(fw => fw.weight >= cutoffWeight)
            }

            facts = factWeights.map(fw => fw.fact)   
        }

        if (window['factId'] != 'undefined') {
            sawFact(window['factId'])
        }

        let factLinkComponent= (props) => 
            <a rel={ props.fact instanceof Sentence ? 'nofollow' : '' } 
                href={ getGuideUrl(props.fact as Fact, props.context) }>{ props.children }</a> 

        return <div id='search' onClick={ (e) => e.stopPropagation() }>
            <div className='form'>
                <input type='text' value={ query }
                    placeholder="search e.g. 'eat' or 'ем'" 
                    onChange={ event => this.setState({ query: (event.target as HTMLInputElement).value })}
                    onKeyPress={ (event) => {
                        if (event.charCode == 13 && facts[0]) {
                            window.location.href = getGuideUrl(facts[0])
                        }
                    } }
                    onKeyUp={ (event) => {
                        if (event.keyCode == 27) {
                            this.setState({ query: '' })
                        }
                    }
                    }/>
            </div>
            {
                query ?
                    <div className='results'>
                        {
                            facts.length ?
                                <ul>{
                                    facts.map(f =>
                                        renderRelatedFact(f, this.props.corpus, factLinkComponent)
                                    )
                                }</ul>
                            :
                            <div className='error'>Could not find anything. Search for a word (in Russian or English), 
                                an expression or a grammatical term. 
                                <br/><br/>
                                Morpheem contains a limited vocabulary up to intermediate level.</div>
                        }
                    </div>
                    :
                    null
            }
        </div>
    }
}