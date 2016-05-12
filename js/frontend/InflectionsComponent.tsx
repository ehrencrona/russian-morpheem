/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import InflectedWord from '../shared/InflectedWord'
import Inflection from '../shared/Inflection'

import Tab from './Tab'
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
    word?: InflectedWord,
    onSelect?: (word: Word) => any 
}

interface State {
    inflection?: Inflection,
    change?: boolean
}

let React = { createElement: createElement }

const FIELDS = {
    v: {
        cols: [ 'singular', 'plural' ],
        rows: [ 'infinitive', '1st person', '2nd person', '3rd person'],
        forms: [ ['inf', ''], ['1', '1pl'], ['2', '2pl'], ['3', '3pl'] ]  
    } ,
    adj: {
        cols: [ 'm sg', 'n sg', 'f sg', 'plural' ],
        rows: [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
        forms: [
            ['m','n','f','pl'],
            ['genm','genn','genf','genpl'],
            ['datm','datn','datf','datpl'],
            [ [ 'accinanm', 'accanm' ],'accn','accf', [ 'accinanpl', 'accanpl' ]],
            ['instrm','instrn','instrf','instrpl'],
            ['prepm','prepfn','prepf','preppl']
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
    
    formClicked(form) {
        if (this.props.word && this.props.onSelect) {
            this.props.onSelect(this.props.word.inflect(form))
        }
        else {
            let fact = this.state.inflection.getFact(form);

            this.props.tab.openTab(
                <FactComponent corpus={ this.props.corpus } tab={ this.props.tab } 
                    fact={ fact }/>, fact.getId(), fact.getId()
            ) 
        }
    }
    
    changeInflection(inflection: Inflection) {
        this.props.word.setInflection(inflection)
        
        this.setState({
            inflection: inflection
        })
    }
    
    render() {
        let wordsByForm: { [ form:string]: string}
        let forms: string[]

        let inflection = this.state.inflection
        let word: InflectedWord = this.props.word
        
        if (!word) {
            word = new InflectedWord(
                    inflection.getEnding(inflection.defaultForm), 
                    '', null, inflection.defaultForm)
                .setInflection(inflection) 
        } 

        wordsByForm = this.getWordsByForm(word)

        let formComponent = (form) => {
            let fact = this.state.inflection.getFact(form);
            let index = this.props.corpus.facts.indexOf(fact);
            
            if (index > 0) {
                return <div key={form} className='clickable' onClick={ 
                    () => this.formClicked(form) }>
                    { wordsByForm[form] } 
                    <div className='index'><div className='number'>{ index + 1 }</div></div>
                </div>
            }
            else {
                return <div key={form}>{ wordsByForm[form] }</div>
            }
        }
        
        let table = FIELDS[this.state.inflection.pos]
        
        if (!table) {
            console.log('Unknown POS ' + this.state.inflection.pos + ' of ' + this.state.inflection.getId())
            return <div/>;
        }
        
        let alternativeInflections = 
            this.props.corpus.inflections.getPossibleInflections(this.props.word.jp)
                .filter((inflection) => inflection.getId() != this.state.inflection.getId())
                .filter((inflection) => inflection.pos == this.state.inflection.pos)
        
        return (
            <div className='inflections'>
                <div className='inflectionName'>{ this.state.inflection.id + (inflection.pos ? ' (' + inflection.pos + ')' : '') } 
                    { (this.props.word && alternativeInflections.length ? 
                        <div className='button' onClick={ () => this.setState({ change: !this.state.change })}>
                            { (this.state.change ? 'Done' : 'Change') }</div>
                        :
                        <div/>) }
                </div>

                { (this.state.change ?
                   
                    <div className='buttonBar'>{
                        alternativeInflections.map((inflection) =>
                            <div className='button' key={ inflection.getId() } 
                                onClick={ () => { this.changeInflection(inflection) } }>{ inflection.getId()
                                    + (inflection.pos ? ' (' + inflection.pos + ')' : '')    
                                }</div>
                        )
                    }</div>

                :

                <div/>
                   
                ) }
                
                <table>
                    <thead>
                        <tr>
                            <td></td>
                            { table.cols.map((name) => 
                                <td key={name}>{name}</td>
                            ) }
                        </tr>
                    </thead>
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