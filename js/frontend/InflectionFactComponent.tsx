/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/Fact'
import Inflection from '../shared/Inflection'

import InflectionFact from '../shared/InflectionFact'

import Tab from './Tab'
import InflectionsComponent from './InflectionsComponent'
import MoveFactButton from './MoveFactButtonComponent'
import TagButton from './TagButtonComponent'
import WordsWithInflectionComponent from './WordsWithInflectionComponent'
import ExternalSentencesComponent from './ExternalSentencesComponent'
import SentencesWithFact from './SentencesWithFactComponent';

import Sentence from '../shared/Sentence'
import Word from '../shared/Word'

import { Component, createElement } from 'react';
import { findSentencesForFact, FactSentences } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    fact: InflectionFact,
    tab: Tab
}

interface State {
    tab: string
}

let React = { createElement: createElement }

export default class InflectionFactComponent extends Component<Props, State> {

    constructor(props) {
        super(props)
        
        this.state = {
            tab: 'words'
        }
    }

    render() {
        let fact = this.props.fact

        let tabButton = (id, name) =>
            <div className={ 'button ' + (this.state.tab == id ? ' selected' : '') } 
                onClick={ () => { this.setState({ tab: id }) }}>{ name }</div>

        let tab;    

        if (this.state.tab == 'words') {
            tab = <WordsWithInflectionComponent corpus={ this.props.corpus } tab={ this.props.tab } 
                    inflection={ fact.inflection } form={ fact.form }/>
        }
        else if (this.state.tab == 'sentences') {
            tab = <SentencesWithFact 
                ref='sentencesWithFact'
                corpus={ this.props.corpus} 
                fact={ this.props.fact } 
                tab={ this.props.tab } />
        }
        else if (this.state.tab == 'inflection') {
            let inflections = [];
            let at = fact.inflection;
            
            while (at) {
                inflections.push(at)
                
                at = at.inherits
            }
            
            let hideForms = {}

            tab = inflections.map((inflection: Inflection) => {                
                let result = <div>
                    <h3>{ inflection.id }</h3>
                    <InflectionsComponent corpus={ this.props.corpus } 
                        inflection={ inflection } tab={ this.props.tab } 
                        hideForms={ Object.assign({}, hideForms) } />
                </div>
                
                Object.assign(hideForms, inflection.endings)
                
                return result
            })
        }
        else if (this.state.tab == 'import') {
            tab = <ExternalSentencesComponent corpus={ this.props.corpus } fact={ this.props.fact } tab={ this.props.tab } />
        }

        return (<div>

            <div className='buttonBar'>                
                { tabButton('words', 'Words') }
                { tabButton('sentences', 'Sentences') }
                { tabButton('inflection', 'Inflection') }
                { tabButton('import', 'Import') }

                <MoveFactButton corpus={ this.props.corpus} fact={ this.props.fact }
                    onMove={ () => (this.refs['sentencesWithFact'] as SentencesWithFact).forceUpdate() } 
                    />
                <TagButton corpus={ this.props.corpus} fact={ this.props.fact } />
            </div>
        
            { tab }
        </div>)
            
    }
}
