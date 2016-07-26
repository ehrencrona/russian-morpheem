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
            explainWord: this.props.unknownFact.word.wordFact as InflectedWord
        }
    }

    explain() {
        this.setState({ explain: true }) 
    }

    render() {
        let studyWord = this.props.unknownFact.word
        let word = studyWord.wordFact

        let hiddenId = this.props.hiddenFact && this.props.hiddenFact.getId()

        if (word instanceof InflectedWord) {
            let desc

            if (word.word.getId() == hiddenId || 
                    word.word.inflection.getFact(word.form).getId() == hiddenId) {
                desc = <div>You are looking for the <strong>{ studyWord.form.name }</strong></div>
            }
            else {
                desc = <div><strong>{ studyWord.jp }</strong> is the <strong>{ studyWord.form.name }</strong> of <strong>{      word.word.getDefaultInflection().jp }</strong></div>
            }
    
            return <div>
                { desc }
                {
                        this.state.explain ?

                        <ExplainFormComponent 
                            corpus={ this.props.corpus } 
                            word={ this.state.explainWord } 
                            knowledge={ this.props.knowledge }
                            onClose={ () => this.setState({ explain: false }) }
                            onSelect={ (word) => this.setState({ explainWord: word })} 
                        />

                        :

                        <div/>
                }
            </div>
        }
        else {
            console.warn(word + ' was not inflected, yet InflectionFactComponent got it.')

            return <div/>
        }
    }
}
