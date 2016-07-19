/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import InflectedWord from '../shared/InflectedWord'
import InflectableWord from '../shared/InflectableWord'
import Inflection from '../shared/inflection/Inflection'

import Word from '../shared/Word'
import getLanguage from './getLanguage'

import { Component, createElement } from 'react';
import INFLECTION_FORMS from '../shared/inflection/InflectionForms'
import { MISSING_INDEX } from '../shared/fact/Facts'

interface Props {
    corpus: Corpus,
    inflection: Inflection,
    allowAdd?: boolean,
    word?: InflectableWord,
    onSelect?: (form: string) => any
    onAdd?: (form: string) => any
    hideForms?: Object
}

interface State {
}

let React = { createElement: createElement }

export default class InflectionsComponent extends Component<Props, State> {
    getWordsByForm(word: InflectableWord): { [ form:string]: string} {
        let wordsByForm : { [ form:string]: string} = {}

        let inflections: InflectedWord[] = []
        
        word.visitAllInflections((inflected: InflectedWord) => { 
            inflections.push(inflected)    
        })

        let forms: string[] = []
        
        inflections.forEach((word: InflectedWord) => {
            wordsByForm[word.form] = word.jp
        })

        return wordsByForm 
    }

    render() {
        let wordsByForm: { [ form:string]: string}
        let forms: string[]

        let inflection = this.props.inflection
        let word: InflectableWord = this.props.word

        if (!word) {
            word = new InflectableWord('.', inflection)
        } 

        wordsByForm = this.getWordsByForm(word)

        let formComponent = (form) => {
            let fact = this.props.inflection.getFact(form)
            let index = this.props.corpus.facts.indexOf(fact)

            let className = 'form'
            let inherited = !this.props.inflection.endings[form]
            
            if ((!this.props.word && inherited) ||
                (this.props.hideForms && this.props.hideForms[form] != undefined)) {
                return <div key={form}/>
            }

            if (index < MISSING_INDEX) {
                className += ' clickable'

                return <div key={form} className={ className } onClick={ 
                    () => this.props.onSelect && this.props.onSelect(form) }>
                    { wordsByForm[form] } 
                    <div className='index'><div className='number'>{ index + 1 }</div></div>
                </div>
            }
            else {
                return <div key={form} className={ className }>{ wordsByForm[form] }
                    { this.props.allowAdd != false ?
                        <div className='add' onClick={ () => this.props.onAdd && this.props.onAdd(form) }>
                            <div className='number'>add</div></div>
                        :
                        <div/>
                    }
                </div>
            }
        }

        let table = INFLECTION_FORMS[getLanguage()][this.props.inflection.pos]
        
        if (!table) {
            console.log('Unknown PoS ' + this.props.inflection.pos + ' of ' + this.props.inflection.getId())
            return <div/>;
        }

        return (
            <div className='inflections'>
                <table>
                { table.cols.length > 1 ?                            
                    <thead>
                        <tr>
                            <td></td>
                            { table.cols.map((name) => 
                                <td key={name}>{name}</td>
                            ) }
                        </tr>
                    </thead>
                    : []
                }
                    <tbody>
                        { table.forms.map((forms, index) => {
                            return <tr key={ index }>
                                    <td>{ table.rows[index] }</td>
                                {
                                    forms.map((form) => {
                                        let endings
                                        
                                        if (typeof form == 'string') {
                                            if (wordsByForm[form]) {
                                                endings = formComponent(form) 
                                            }
                                        }
                                        else {
                                            endings = form.filter((form) => wordsByForm[form])
                                                .map(formComponent)

                                            if (!endings.length) {
                                                endings = null
                                            }
                                        }
                                        
                                        if (endings) {
                                            return <td key={form.toString()} className='full'>
                                                {
                                                    endings
                                                }
                                            </td>
                                        }
                                        else {
                                            return <td key={form.toString()}/> 
                                        }
                                    })                                    
                                }
                            </tr> 
                            
                        }) }
                    </tbody>
                </table>
            </div>)
    }
}