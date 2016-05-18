/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import InflectedWord from '../shared/InflectedWord'
import Inflection from '../shared/Inflection'

import Tab from './Tab'
import FactComponent from './FactComponent'
import Word from '../shared/Word'

import { Component, createElement } from 'react';
import { findSentencesForFact, FactSentences } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    inflection: Inflection,
    tab: Tab,
    word?: InflectedWord,
    onSelect?: (word: Word) => any 
}

interface State {
    inflection?: Inflection
}

let React = { createElement: createElement }

let FIELDS = {
    v: {
        cols: [ 'singular', 'plural' ],
        rows: [ 'infinitive', '1st person', '2nd person', '3rd person'],
        forms: [ ['inf', ''], ['1', '1pl'], ['2', '2pl'], ['3', '3pl'] ]  
    } ,
    adj: {
        cols: [ 'm sg', 'n sg', 'f sg', 'plural' ],
        rows: [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep', 'short' ],
        forms: [
            ['m','n','f','pl'],
            ['genm','genn','genf','genpl'],
            ['datm','datn','datf','datpl'],
            [ [ 'accinanm', 'accanm' ],'accn','accf', [ 'accinanpl', 'accanpl' ]],
            ['instrm','instrn','instrf','instrpl'],
            ['prepm','prepfn','prepf','preppl'],
            ['shortm', 'shortf', 'shortn']
        ]
    },
    
    n: {
        cols: [ 'singular', 'plural' ], 
        rows: [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
        forms: [        
            ['nom','pl'],
            ['gen','genpl'],
            ['dat','datpl'],
            ['acc','accpl'],
            ['instr','instrpl'],
            ['prep','preppl']
        ]
    },
    pron: {
        cols: [ '' ],
        rows: [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
        forms: [ ['nom'], ['gen'], ['dat'], ['instr'], ['prep'] ]
    }
};

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
    
    getWordsByForm(word: InflectedWord): { [ form:string]: string} {
        let wordsByForm : { [ form:string]: string} = {}

        let inflections: InflectedWord[] = []
        
        word.visitAllInflections((inflected: InflectedWord) => { 
            inflections.push(inflected)    
        }, false)

        let forms: string[] = []
        
        inflections.forEach((word: InflectedWord) => {
            wordsByForm[word.form] = word.toString()
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
        
        this.openForm(form)
    }

    render() {
        let wordsByForm: { [ form:string]: string}
        let forms: string[]

        let inflection = this.state.inflection
        let word: InflectedWord = this.props.word
        
        if (!word) {
            word = new InflectedWord(
                    inflection.getEnding(inflection.defaultForm), 
                    null, inflection.defaultForm)
                .setInflection(inflection) 
        } 

        wordsByForm = this.getWordsByForm(word)

        let formComponent = (form) => {
            let fact = this.state.inflection.getFact(form);
            let index = this.props.corpus.facts.indexOf(fact);
            
            let className = 'form'
            let inherited = !this.state.inflection.endings[form]
            
            if (!this.props.word && inherited) {
                className += ' inherited'
            }

            if (index > 0) {
                className += ' clickable'

                return <div key={form} className={ className } onClick={ 
                    () => this.formClicked(form) }>
                    { wordsByForm[form] } 
                    <div className='index'><div className='number'>{ index + 1 }</div></div>
                </div>
            }
            else {
                return <div key={form} className={ className }>{ wordsByForm[form] }
                    { !inherited ?
                        <div className='add' onClick={ () => this.addFact(form) }><div className='number'>add</div></div>
                        :
                        []
                    }
                </div>
            }
        }
        
        let table = FIELDS[this.state.inflection.pos]
        
        if (!table) {
            console.log('Unknown PoS ' + this.state.inflection.pos + ' of ' + this.state.inflection.getId())
            return <div/>;
        }
                
        return (
            <div className='inflections'>                
                { this.props.inflection.inherits ?
                    
                        <div className='inherits'>
                            inherits&nbsp;
                            <span className='clickable' onClick={ () => this.inflectionClicked(this.props.inflection.inherits) }>
                                { this.props.inflection.inherits.id }
                            </span>
                        </div>
                    
                    :
                    
                    [] }
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
                                        return <td key={form.toString()}>
                                            {
                                                (typeof form == 'string' ?
                                                    (wordsByForm[form] ? formComponent(form) : '')
                                                    :
                                                    form.map((form) => (wordsByForm[form] ? formComponent(form) : ''))
                                                )
                                            }
                                        </td>                                        
                                    })                                    
                                }
                            </tr> 
                            
                        }) }
                    </tbody>
                </table>
            </div>)
    }
}