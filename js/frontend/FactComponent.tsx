/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import InflectedWord from '../shared/InflectedWord'

import { Tab } from './TabSetComponent'
import SentenceComponent from './SentenceComponent'
import Sentence from '../shared/Sentence'
import Word from '../shared/Word'

import { Component, createElement } from 'react';
import { findSentencesForFact, FactSentences } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    fact: Fact,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class FactComponent extends Component<Props, State> {
    addSentence() {
        let fact = this.props.fact
        
        if (fact instanceof Word) {
            let sentence = new Sentence([ fact ], null)
            
            this.props.corpus.sentences.add(sentence)
            
            this.openSentence(sentence)
        }
    }

    openSentence(sentence: Sentence) {
        this.props.tab.openTab(
            <SentenceComponent sentence={ sentence } corpus={ this.props.corpus } tab={ null }/>,
            sentence.toString(),
            sentence.id.toString()
        )
    }

    render() {
        let fact = this.props.fact
        
        let index : FactSentences =
            findSentencesForFact(fact, this.props.corpus.sentences, this.props.corpus.facts)
        
        let toSentence = (sentence) => {
            return <li 
                key={ sentence.id }
                className='clickable'
                onClick={ () => this.openSentence(sentence) }>{ sentence.toString() }</li>
        }
         
        let inflectionComponents = <div/>
        
        if (fact instanceof InflectedWord) {
            let inflections: InflectedWord[] = []
            
            fact.visitAllInflections((inflected: InflectedWord) => { 
                inflections.push(inflected)    
            }, false)
            
            let forms = []
            
            function stripPlural(form, word: InflectedWord) {
                if (form == 'pl') {
                    return word.inflection.defaultForm
                }
                
                return (form.substr(form.length - 2) == 'pl' ?
                    form.substr(0, form.length - 2) :
                    form);
            }

            let wordsByForm = {}

            inflections.forEach((word: InflectedWord) => 
            {
                let form = stripPlural(word.form, word)
                
                wordsByForm[word.form] = word
                
                if (!forms.find((f) => f == form)) {
                    forms.push(form)
                }
            })

            inflectionComponents = (
                <table className='inflections'>
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
                                (form == fact.inflection.defaultForm ? 'pl' : form + 'pl')
                            
                            return <tr key={ form }>
                                <td>
                                    { form }
                                </td>
                                <td> 
                                    { (wordsByForm[form] ? wordsByForm[form].toString() : '') } 
                                </td>
                                <td> 
                                    { (wordsByForm[pluralForm] ? wordsByForm[pluralForm].toString() : '') } 
                                </td>
                            </tr> 
                        })
                        }
                    </tbody>
                </table>)
        }
         
        return (<div>
            { inflectionComponents }
        
            { this.props.fact instanceof Word ?

                <div className='buttonBar'>
                    <div className='button' onClick={ () => this.addSentence() }>Add sentence</div>
                </div>

                :

                <div/>
            }
        
            <h3>Easy</h3> 
            
            <ul>
            { index.easy.map(toSentence) }
            </ul>

            <h3>Hard</h3> 
            
            <ul>
            { index.hard.map(toSentence) }
            </ul>
        </div>)
    }
}
