/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import InflectedWord from '../shared/InflectedWord'
import InflectableWord from '../shared/InflectableWord'
import Inflection from '../shared/inflection/Inflection'

import Tab from './Tab'
import FactComponent from './FactComponent'
import Word from '../shared/Word'
import getLanguage from './getLanguage'

import { Component, createElement } from 'react';
import INFLECTION_FORMS from '../shared/inflection/InflectionForms'
import { MISSING_INDEX } from '../shared/fact/Facts'

interface Props {
    corpus: Corpus,
    inflection: Inflection,
    tab: Tab,
    word?: InflectableWord,
    onSelect?: (word: Word) => any
    hideForms?: Object
}

interface State {
    inflection?: Inflection
}

let React = { createElement: createElement }


export default class InflectionsComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
        
        this.state = {
            inflection: props.inflection
        }
    }
    
    componentWillReceiveProps(newProps) {
        this.setState({
            inflection: newProps.inflection
        })    
    }
    
    getWordsByForm(word: InflectableWord): { [ form:string]: string} {
        let wordsByForm : { [ form:string]: string} = {}

        let inflections: InflectedWord[] = []
        
        word.visitAllInflections((inflected: InflectedWord) => { 
            inflections.push(inflected)    
        }, false)

        let forms: string[] = []
        
        inflections.forEach((word: InflectedWord) => {
            wordsByForm[word.form] = word.jp
        })

        return wordsByForm 
    }

    inflectionClicked(inflection: Inflection) {
        this.props.tab.openTab(
            <InflectionsComponent 
                corpus={ this.props.corpus } 
                tab={ this.props.tab } 
                inflection={ inflection }/>, 
            inflection.getId(), inflection.getId())
    }

    formClicked(form) {
        if (this.props.word && this.props.onSelect) {
            this.props.onSelect(this.props.word.inflect(form))
        }
        else {
            this.openForm(form)
        }
    }
    
    openForm(form) {
        let fact = this.state.inflection.getFact(form)

        this.props.tab.openTab(
            <FactComponent corpus={ this.props.corpus } tab={ this.props.tab } 
                fact={ fact }/>, fact.getId(), fact.getId()
        ) 
    }
    
    changeInflection(inflection: Inflection) {
        this.props.corpus.words.changeInflection(this.props.word, inflection)

        this.setState({
            inflection: inflection
        })
    }
    
    addFact(form: string) {
        let fact = this.props.inflection.getFact(form)
        
        this.props.corpus.facts.add(fact)
        
        this.forceUpdate()
    }

    render() {
        let wordsByForm: { [ form:string]: string}
        let forms: string[]

        let inflection = this.state.inflection
        let word: InflectableWord = this.props.word

        if (!word) {
            word = new InflectableWord('.', inflection)
        } 

        wordsByForm = this.getWordsByForm(word)

        let formComponent = (form) => {
            let fact = this.state.inflection.getFact(form)
            let index = this.props.corpus.facts.indexOf(fact)

            let className = 'form'
            let inherited = !this.state.inflection.endings[form]
            
            if ((!this.props.word && inherited) ||
                (this.props.hideForms && this.props.hideForms[form] != undefined)) {
                return <div key={form}/>
            }

            if (index < MISSING_INDEX) {
                className += ' clickable'

                return <div key={form} className={ className } onClick={ 
                    () => this.formClicked(form) }>
                    { wordsByForm[form] } 
                    <div className='index'><div className='number'>{ index + 1 }</div></div>
                </div>
            }
            else {
                return <div key={form} className={ className }>{ wordsByForm[form] }
                    <div className='add' onClick={ () => this.addFact(form) }><div className='number'>add</div></div>
                </div>
            }
        }

        let table = INFLECTION_FORMS[getLanguage()][this.state.inflection.pos]
        
        if (!table) {
            console.log('Unknown PoS ' + this.state.inflection.pos + ' of ' + this.state.inflection.getId())
            return <div/>;
        }

        let children = this.props.corpus.inflections.inflections.filter(
            (other) => this.props.inflection == other.inherits)

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