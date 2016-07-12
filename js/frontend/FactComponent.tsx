/// <reference path="../../typings/react/react.d.ts" />

import Corpus from '../shared/Corpus'
import Fact from '../shared/fact/Fact'
import InflectedWord from '../shared/InflectedWord'
import InflectionFact from '../shared/inflection/InflectionFact'
import Phrase from '../shared/phrase/Phrase'

import Tab from './Tab'

import InflectableWordFactComponent from './InflectableWordFactComponent'
import PhraseFactComponent from './PhraseFactComponent'
import WordFactComponent from './WordFactComponent'
import InflectionFactComponent from './InflectionFactComponent'
import TransformFactComponent from './TransformFactComponent'

import InflectableWord from '../shared/InflectableWord'
import Word from '../shared/Word'
import { EndingTransform } from '../shared/Transforms'

import { Component, createElement } from 'react'

interface Props {
    corpus: Corpus,
    fact: Fact,
    tab: Tab
}

interface State {}

let React = { createElement: createElement }

export default class FactComponent extends Component<Props, State> {
    render() {
        let fact = this.props.fact

        if (fact instanceof Word) {
            return <WordFactComponent corpus={ this.props.corpus } fact={ fact } tab={ this.props.tab } />
        }
        else if (fact instanceof InflectableWord) {
            return <InflectableWordFactComponent corpus={ this.props.corpus } fact={ fact } tab={ this.props.tab } />
        }
        else if (fact instanceof InflectionFact) {
            return <InflectionFactComponent corpus={ this.props.corpus } fact={ fact } tab={ this.props.tab } />
        }
        else if (fact instanceof Phrase) {
            return <PhraseFactComponent corpus={ this.props.corpus } fact={ fact } tab={ this.props.tab } />
        }
        else if (fact instanceof EndingTransform) {
            return <TransformFactComponent corpus={ this.props.corpus } fact={ fact } tab={ this.props.tab } />
        }
    }
}
