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
    pron: [
        {
            cols: [ '' ],
            rows: [ 'nom', 'gen', 'dat', 'acc', 'instr', 'prep' ],
            forms: [ ['nom'], ['gen'], ['dat'], ['instr'], ['prep'] ]
        }
    ]
};

export default class InflectionsComponent extends Component<Props, State> {
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

        wordsByForm = this.getWordsByForm(word)

        let formComponent = (form) => {
            let fact = this.props.inflection.getFact(form);
            let index = this.props.corpus.facts.indexOf(fact);
            
            if (index > 0) {
                return <div key={form} className='clickable' onClick={ () =>
                    this.props.tab.openTab(
                        <FactComponent corpus={ this.props.corpus } tab={ this.props.tab } 
                            fact={ fact }/>, fact.getId(), fact.getId()
                    ) 
                }>
                    { wordsByForm[form] } 
                    <div className='index'><div className='number'>{ index + 1 }</div></div>
                </div>
            }
            else {
                return <div key={form}>{ wordsByForm[form] }</div>
            }
        }
        
        let table = FIELDS[this.props.inflection.pos]
        
        if (!table) {
            console.log('Unknown POS ' + this.props.inflection.pos + ' of ' + this.props.inflection.getId())
            return <div/>;
        }
        
        return (
            <div className='inflections'>
                <div className='inflectionName'>{ this.props.inflection.id }</div>
                
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