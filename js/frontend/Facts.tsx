/// <reference path="../../typings/react/react.d.ts" />

import {Component,createElement} from 'react';
import Corpus from '../shared/Corpus';

import Fact from './Fact';
import { Tab } from './TabSet';

import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class Facts extends Component<Props, State> {
    render() {
        let index : { [factId: string]: FactSentenceIndex } =
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        return (<div>
            {
                this.props.corpus.facts.facts.map((fact) => {
                    let indexEntry: FactSentenceIndex = index[fact.getId()] || { ok: 0, easy: 0, hard: 0, factIndex: 0 }

                    return <div 
                        key={ fact.getId() }
                        onClick={ () => this.props.tab.openTab(
                            <Fact fact={ fact } corpus={ this.props.corpus } tab={ null }/>,
                            fact.getId(),
                            fact.getId()
                        ) }>{ fact.getId() } ({indexEntry.easy}, {indexEntry.ok}, {indexEntry.hard})</div>
                })
            }
            </div>)
    }
}
