
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import Inflection from '../../shared/inflection/Inflection'

import Word from '../../shared/Word'
import getLanguage from '../getLanguage'

import { Component, createElement } from 'react';
import INFLECTION_FORMS from '../../shared/inflection/InflectionForms'
import { MISSING_INDEX } from '../../shared/fact/Facts'

interface Props {
    corpus: Corpus,
    inflection: Inflection,
    renderForm: (inflectedWord: string, form: string, factIndex: number) => any
    word?: InflectableWord,
    hideForms?: Object
}

interface State {
}

let React = { createElement: createElement }

export default class InflectionTableComponent extends Component<Props, State> {
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

            let inherited = !this.props.inflection.endings[form]
            
            if ((!this.props.word && inherited) ||
                (this.props.hideForms && this.props.hideForms[form] != undefined)) {
                return <div key={form}/>
            }

            return this.props.renderForm(wordsByForm[form], form, index)
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
                                <td key={name}>{ name }</td>
                            ) }
                        </tr>
                    </thead>
                    : []
                }
                    <tbody>
                        { table.forms.map((forms, index) => {
                            let count = 0

                            let cells = forms.map((form) => {
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
                                    count++
                                    
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
                     
                            if (!count) {
                                return null
                            }

                            return <tr key={ index }>
                                    <td>{ table.rows[index] }</td>
                                {
                                    cells
                                }
                            </tr> 
                            
                        }) }
                    </tbody>
                </table>
            </div>)
    }
}