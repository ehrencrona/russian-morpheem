import { InflectionForm } from '../../shared/inflection/InflectionForm';
import { NamedWordForm } from '../../shared/inflection/WordForm';


import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import Inflection from '../../shared/inflection/Inflection'
import Phrase from '../../shared/phrase/Phrase'

import InflectionFact from '../../shared/inflection/InflectionFact'
import InflectedWord from '../../shared/InflectedWord'
import Word from '../../shared/Word'

import Sentence from '../../shared/Sentence'
import InflectableWord from '../../shared/InflectableWord'
import TagFact from '../../shared/TagFact'

import { Component, createElement } from 'react';

import findExamplesOfInflection from '../../shared/inflection/findExamplesOfInflection'

interface Props {
    corpus: Corpus,
    fact: Fact,
    index: number
}

interface State {
}

let React = { createElement: createElement }
const SHOW_COUNT = 3

export default class FactNameComponent extends Component<Props, State> {

    constructor(props) {
        super(props)
        
        this.state = {
            tab: 'words'
        }
    }

    render() {
        let fact = this.props.fact
        let examples

        if (fact instanceof InflectionFact) {
            examples = findExamplesOfInflection(fact, this.props.corpus, SHOW_COUNT, 
                (fact, index) => index > this.props.index)
        }

        if (examples && fact instanceof InflectionFact) { 
            return <span>
                { examples.easy.join(', ') } 
                { examples.hard.length ? <span className='hard'>{ (examples.easy.length ? ', ' : '') + examples.hard.join(', ') }</span>  : '' } 
                { (examples.more ? '...' : '') } 
                <span className='form'>{ fact.form }</span>
            </span>
        }
        else if (fact instanceof InflectionForm) {
            return <span>{ fact.id + ': ' + fact.name }</span>
        }
        else if (fact instanceof NamedWordForm) {
            return <span>{ fact.id + ': ' + fact.name }</span>
        }
        else if (fact instanceof Phrase) {
            return <span>{ (fact.description || fact.getId()) + ': ' + fact.en }</span>
        }
        else {
            let name = fact.getId()
            let en = ''
            
            if (fact instanceof InflectedWord) {
                name = fact.toString()
            }

            if (fact instanceof Word || fact instanceof InflectableWord) {
                en = fact.getEnglish()
            }

            return <span>{ name }: { en } </span>
        }
    }
}
