import InflectionFact from '../../../shared/inflection/InflectionFact'
import findExamplesOfInflection from '../../../shared/inflection/findExamplesOfInflection'
import Corpus from '../../../shared/Corpus'
import InflectedWord from '../../../shared/InflectedWord'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import { Knowledge } from '../../../shared/study/Exposure'
import { FORMS } from '../../../shared/inflection/InflectionForms'

import { Component, createElement } from 'react'

interface Props {
    fact: InflectionFact
    corpus: Corpus
    knowledge: NaiveKnowledge
}

interface State {
    exampleWords: InflectedWord[]    
}

let React = { createElement: createElement }

export default class inflectionFactEntryComponent extends Component<Props, State> {
    componentWillMount() {
        let fact = this.props.fact

        let examples = findExamplesOfInflection(this.props.fact, this.props.corpus, 2, 
            (fact) => this.props.knowledge.getKnowledge(fact) == Knowledge.DIDNT_KNOW)

        this.state = {
            exampleWords: examples.easy.concat(examples.hard)
        }
    }

    render() {
        return <dl>
            <dt>{
                this.state.exampleWords.map(w => <div key={ w.getId() }>{ w.toText() }</div>)
            }</dt>
            <dd>{ FORMS[this.props.fact.form].name }</dd>
        </dl>
    }
}
