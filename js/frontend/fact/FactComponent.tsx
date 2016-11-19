import { NamedWordForm } from '../../shared/inflection/WordForm';

import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import TagFact from '../../shared/TagFact'
import InflectedWord from '../../shared/InflectedWord'
import InflectionFact from '../../shared/inflection/InflectionFact'
import Phrase from '../../shared/phrase/Phrase'

import InflectableWordFactComponent from '../inflection/InflectableWordFactComponent'
import PhraseFactComponent from '../phrase/PhraseFactComponent'
import WordFactComponent from '../word/WordFactComponent'
import InflectionFactComponent from '../inflection/InflectionFactComponent'
import InflectionFormComponent from '../inflection/InflectionFormComponent'
import WordFormComponent from '../inflection/WordFormComponent'

import Tab from '../OpenTab'
import TagFactComponent from '../TagFactComponent'
import TransformFactComponent from '../TransformFactComponent'

import InflectableWord from '../../shared/InflectableWord'
import Word from '../../shared/Word'
import InflectionForm from '../../shared/inflection/InflectionForm' 
import { EndingTransform } from '../../shared/Transforms'

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
        else if (fact instanceof InflectionForm) {
            return <InflectionFormComponent corpus={ this.props.corpus } fact={ fact } tab={ this.props.tab } />
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
        else if (fact instanceof NamedWordForm) {
            return <WordFormComponent corpus={ this.props.corpus } fact={ fact } tab={ this.props.tab } />
        }
        else if (fact instanceof TagFact) {
            return <TagFactComponent corpus={ this.props.corpus } fact={ fact } tab={ this.props.tab } />
        }
        else {
            console.error('Unhandled fact', fact)
            return null
        }
    }
}
