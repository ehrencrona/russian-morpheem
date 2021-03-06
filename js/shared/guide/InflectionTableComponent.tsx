import { PartOfSpeech } from '../inflection/Dimensions';
import { InflectionForm } from '../inflection/InflectionForm';

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import { MISSING_INDEX } from '../../shared/fact/Facts'

import Inflection from '../../shared/inflection/Inflection'
import { CASES, FORMS, INFLECTION_FORMS } from '../../shared/inflection/InflectionForms';

import FactLinkComponent from './fact/FactLinkComponent'

import Word from '../../shared/Word'

import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus,
    renderForm: (form: string) => any
    pos: PartOfSpeech,
    mask: (string) => boolean,
    factLinkComponent?: FactLinkComponent
    title?: string
    className?: string
}

interface State {
}

let React = { createElement: createElement }

export function renderWordInflection(word: InflectableWord, corpus: Corpus, 
        renderForm: (InflectedWord, string, number) => any) {
    return (form: string) => {
        let inflected = word.inflect(form)

        if (!inflected) {
            return null
        }

        let fact = word.inflection.getFact(form)
        let index = corpus.facts.indexOf(fact)

        return renderForm(inflected, form, index)
    }
}

export function renderFormName(pos: PartOfSpeech, factLinkComponent: FactLinkComponent, current?: InflectionForm) {
    let linkTo = (content, fact) => React.createElement(
        factLinkComponent,
        { fact: fact, key: fact.getId() },
            content) 

    return (form) => {
        let grammarCase = FORMS[form].grammaticalCase
        let content

        let className = 'otherForm'

        if (current && !current.matches(FORMS[form])) {
            className += ' inactive'
        }

        if (grammarCase) {
            content = 
                <div className={ 'caseName ' + CASES[grammarCase] }>{
                    FORMS[form].name.toUpperCase().split(' ').reduce((lines, line, i) =>
                        lines.concat(line, <br key={ i } />), [] )
                }</div>
        }
        else {
            className += ' nonCase'
            content = 
                FORMS[form].name.split(' ').reduce((lines, line, i) =>
                    lines.concat(line, <br key={ i } />), [] )
        }

        return linkTo(
            <div className={ className }>{
                content
            }</div>, 
            FORMS[form])
    }
}

export class InflectionTableComponent extends Component<Props, State> {
    getWordsByForm(word: InflectableWord): { [ form:string]: string } {
        let wordsByForm : { [ form:string]: string } = {}

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

        let table = INFLECTION_FORMS[this.props.pos]
        
        if (!table) {
            console.log('Unknown PoS ' + this.props.pos)
            return <div/>;
        }

        return (
            <div className={ 'inflections ' + (this.props.className || '') }>
                <table>
                { table.cols.length > 1 ?
                    <thead>
                        <tr>
                            <td className='tableTitle'>{ this.props.title || ''}</td>
                            { table.cols.map((name) => {
                                let [l1, l2] = name.split(' ')

                                // needs to be two lines to align with the h3 next to it.
                                return <td key={name}><div className='pad'>{ l1 }<br/>{ l2 }&nbsp;</div></td> 
                            }) }
                        </tr>
                    </thead>
                    : []
                }
                    <tbody>
                        { table.forms.map((forms, index) => {
                            let count = 0

                            let cells = forms.map((form) => {
                                let content

                                if (typeof form == 'string') {
                                    content = this.props.renderForm(form)
                                }
                                else {
                                    content = form.map(f => this.props.renderForm(f))
                                }

                                if (content) {
                                    count++
                                    
                                    return <td key={ form.toString() } className='full'>
                                        {
                                            content
                                        }
                                    </td>
                                }
                                else {
                                    return <td key={ form.toString() }/> 
                                }
                            })
                     
                            if (!count) {
                                return null
                            }

                            let formId = table.rows[index]
                            let fact = this.props.corpus.facts.get(formId)

                            let name = (formId && FORMS[formId].name) || ''
                            let nameComponent

                            if (name && FORMS[formId].equals({ grammaticalCase: FORMS[formId].grammaticalCase })) {
                                nameComponent = <span className={ 'caseName ' + name }>{ name.toUpperCase() }</span>
                            }
                            else {
                                nameComponent = name
                            }

                            return <tr key={ formId }>
                                {
                                    (fact && this.props.factLinkComponent ?
                                        <td className='clickable'><div className='pad'>{
                                            React.createElement(this.props.factLinkComponent, 
                                            { fact: fact }, 
                                            nameComponent) 
                                        }</div></td>
                                        :
                                        <td><div className='pad'>{ name }</div></td>)
                                }
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

export default InflectionTableComponent