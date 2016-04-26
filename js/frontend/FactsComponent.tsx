/// <reference path="../../typings/react/react.d.ts" />

import {Component,createElement} from 'react';
import Corpus from '../shared/Corpus';

import Fact from './FactComponent';
import { Tab } from './TabSetComponent';

import { indexSentencesByFact, FactSentenceIndex } from '../shared/IndexSentencesByFact'

interface Props {
    corpus: Corpus,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class FactsComponent extends Component<Props, State> {
    render() {
        let index : { [factId: string]: FactSentenceIndex } =
            indexSentencesByFact(this.props.corpus.sentences, this.props.corpus.facts)

        return (<ul>
            {
                this.props.corpus.facts.facts.map((fact) => {
                    let indexEntry: FactSentenceIndex = index[fact.getId()] || { ok: 0, easy: 0, hard: 0, factIndex: 0 }

                    return <li 
                        key={ fact.getId() }
                        className='clickable'
                        onClick={ () => this.props.tab.openTab(
                            <Fact fact={ fact } corpus={ this.props.corpus } tab={ null }/>,
                            fact.getId(),
                            fact.getId()
                        ) }>{ fact.getId() } ({indexEntry.easy}, {indexEntry.ok}, {indexEntry.hard})</li>
                })
            }
            </ul>)
    }
}
