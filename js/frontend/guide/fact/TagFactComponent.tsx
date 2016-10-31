

import { Component, createElement } from 'react'
import Corpus from '../../../shared/Corpus'

import InflectedWord from '../../../shared/InflectedWord'
import InflectableWord from '../../../shared/InflectableWord'

import Fact from '../../../shared/fact/Fact'
import { Knowledge } from '../../../shared/study/Exposure'

import { Factoid } from '../../../shared/metadata/Factoids'
import { getFormName } from '../../../shared/inflection/InflectionForms' 
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import TagFact from '../../../shared/TagFact'

import WordInFormMatch from '../../../shared/phrase/WordInFormMatch'
import PhraseMatch from '../../../shared/phrase/PhraseMatch'
import Phrase from '../../../shared/phrase/Phrase'

import Transform from '../../../shared/Transform'
import { EndingTransform } from '../../../shared/Transforms'

import renderRelatedFact from './renderRelatedFact'
import capitalize from './capitalize'

import StudyFact from '../../study/StudyFact'
import getExamplesUsingInflection from './getExamplesUsingInflection'
import { renderStemToInflected } from './InflectionFactComponent'

import marked = require('marked')

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    fact: TagFact,
    knowledge: NaiveKnowledge,
    onSelectFact: (fact: Fact, context?: InflectedWord) => any
}

interface State {
}

/** Gives general information about a form that matches several forms, typically a case */
export default class TagFactComponent extends Component<Props, State> {
    render() {
        let corpus = this.props.corpus
        let factoid = corpus.factoids.getFactoid(this.props.fact)

        return <div className='tagFact'>
            <h1>{ factoid.name || this.props.fact.id }</h1>
            <div className='columns'>
                <div className='main'>
                    {
                        factoid ? 
                            <div className='factoid' 
                                dangerouslySetInnerHTML={ { __html: marked(factoid.explanation) } }/>
                        :
                            null 
                    }

                    <ul className='factsWithTag'>
                        {
                            (this.props.fact.required || [])
                            .concat(this.props.corpus.facts.getFactsWithTag(this.props.fact.id))
                                .map(fact =>     
                                    renderRelatedFact(fact, corpus, this.props.onSelectFact))
                        }
                    </ul>
                </div>
                <div className='sidebar'>
                    <div>
                        <h3>See also</h3>

                        <ul>
                        {
                            (factoid ? 
                                factoid.relations.map(f => corpus.facts.get(f.fact)).filter(f => !!f) : [])
                                .map(fact =>     
                                    renderRelatedFact(fact, corpus, this.props.onSelectFact) 
                            ) 
                        }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    }
}
