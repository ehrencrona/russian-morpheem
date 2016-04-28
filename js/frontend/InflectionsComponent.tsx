/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import InflectedWord from '../shared/InflectedWord'
import Inflection from '../shared/Inflection'

import { Tab } from './TabSetComponent'
import FactComponent from './FactComponent'
import SentenceComponent from './SentenceComponent'
import Sentence from '../shared/Sentence'
import Word from '../shared/Word'

import { Component, createElement } from 'react';
import { findSentencesForFact, FactSentences } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    inflection: Inflection,
    tab: Tab,
    word?: InflectedWord
}

interface State {}

let React = { createElement: createElement }

export default class InflectionsComponent extends Component<Props, State> {
    stripPlural(form, word: InflectedWord) {
        if (form == 'pl') {
            return word.inflection.defaultForm
        }
        
        return (form.substr(form.length - 2) == 'pl' ?
            form.substr(0, form.length - 2) :
            form);
    }

    getWordsByForm(word: InflectedWord): [ { [ form:string]: string}, string[] ] {
        let wordsByForm : { [ form:string]: string} = {}

        let inflections: InflectedWord[] = []
        
        word.visitAllInflections((inflected: InflectedWord) => { 
            inflections.push(inflected)    
        }, false)
        
        let forms: string[] = []
        
        inflections.forEach((word: InflectedWord) => {
            let form = this.stripPlural(word.form, word)
            
            wordsByForm[word.form] = word.toString()
            
            if (!forms.find((f) => f == form)) {
                forms.push(form)
            }
        })

        return [ wordsByForm, forms ] 
    }
    
    render() {
        let wordsByForm: { [ form:string]: string}
        let forms: string[]

        let inflection = this.props.inflection
        let word: InflectedWord = this.props.word
        
        if (!word) {
            word = new InflectedWord(
                    inflection.getEnding(inflection.defaultForm), 
                    '', null, inflection.defaultForm)
                .setInflection(inflection) 
        } 

        [ wordsByForm, forms ] = this.getWordsByForm(word)

        let formComponent = (form) => {
            let fact = this.props.inflection.getFact(form);
            let index = this.props.corpus.facts.indexOf(fact);
            
            if (index > 0) {
                return <div className='clickable' onClick={ () =>
                    this.props.tab.openTab(
                        <FactComponent corpus={ this.props.corpus } tab={ this.props.tab } fact={ fact }/>, fact.getId(), fact.getId()
                    ) 
                }>
                    <div className='index'><div className='number'>{ index + 1 }</div></div>
                    { wordsByForm[form] } 
                </div>
            }
            else {
                return <div>{ wordsByForm[form] }</div>
            }
        }
        
        return (
            <div className='inflections'>
                <div className='inflectionName'>{ this.props.inflection.id }</div>
                
                <table>
                    <thead>
                        <tr>
                            <td>Form</td>
                            <td>Singular</td>
                            <td>Plural</td>
                        </tr>
                    </thead>
                    <tbody>
                        { forms.map((form) => {
                            let pluralForm = 
                                (form == this.props.inflection.defaultForm ? 'pl' : form + 'pl')
                            
                            return <tr key={ form }>
                                <td>
                                    { form }
                                </td>
                                <td> 
                                    { (wordsByForm[form] ? formComponent(form) : '') } 
                                </td>
                                <td> 
                                    { (wordsByForm[pluralForm] ? formComponent(pluralForm) : '') } 
                                </td>
                            </tr> 
                        })
                        }
                    </tbody>
                </table>
            </div>)
    }
}