/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import InflectedWord from '../../shared/InflectedWord'
import { getFormName } from '../../shared/inflection/InflectionForms' 
import InflectionFact from '../../shared/inflection/InflectionFact'
import LeitnerKnowledge from '../../shared/study/LeitnerKnowledge'

import { FactComponentProps } from './UnknownFactComponent'
import ExplainFormComponent from './ExplainFormComponent'

let React = { createElement: createElement }

interface State {
    explain?: boolean,
    explainWord?: InflectedWord
}

export default class InflectionFactComponent extends Component<FactComponentProps<InflectionFact>, State> {
    constructor(props) {
        super(props)

        this.state = {
            explainWord: this.props.unknownFact.word as InflectedWord
        }
    }

    explain() {
        this.setState({ explain: true }) 
    }

    render() {
        let word = this.props.unknownFact.word

        if (word instanceof InflectedWord) {
            return <div><strong>{ word.jp }</strong> is the <strong>{ getFormName(word.form) }</strong> of <strong>{ word.word.getDefaultInflection().jp }</strong>
                
                {
                    this.state.explain ?

                    <ExplainFormComponent 
                        corpus={ this.props.corpus } 
                        word={ this.state.explainWord } 
                        knowledge={ this.props.factKnowledge }
                        onClose={ () => this.setState({ explain: false }) }
                        onSelect={ (word) => this.setState({ explainWord: word })} 
                    />

                    :

                    <div/>
                }
        
            </div>
        }
        else {
            console.warn(word + ' was not inflected yet InflectionFactComponent got it.')

            return <div/>
        }
    }
}
