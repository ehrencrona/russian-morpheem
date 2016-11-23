

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
import FactLinkComponent from './FactLinkComponent'

import { FactPivotTable, renderFactEntry } from '../pivot/PivotTableComponent'
import PhrasePrepositionDimension from '../pivot/PhrasePrepositionDimension'
import PhraseCaseDimension from '../pivot/PhraseCaseDimension'

import marked = require('marked')

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    fact: TagFact,
    knowledge: NaiveKnowledge,
    factLinkComponent: FactLinkComponent
}

interface State {
}

/** Gives general information about a form that matches several forms, typically a case */
export default class TagFactComponent extends Component<Props, State> {
    render() {
        let props = this.props
        let corpus = props.corpus
        let factoid = corpus.factoids.getFactoid(props.fact)

        let factsWithTag = props.corpus.facts.getFactsWithTag(props.fact.id)

        return <div className='tagFact'>
            <h1>{ factoid.name || props.fact.id }</h1>
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
                            factsWithTag.length < 5 || factsWithTag.find(f => !(f instanceof Phrase)) 
                            ? factsWithTag
                                .map(fact =>     
                                    renderRelatedFact(fact, corpus, props.factLinkComponent))
                            : <FactPivotTable
                                data={ factsWithTag }
                                getIdOfEntry={ (f) => f.getId() }
                                renderEntry={ renderFactEntry(props.corpus, props.factLinkComponent) }
                                dimensions={ [ 
                                    new PhrasePrepositionDimension(props.factLinkComponent), 
                                    new PhraseCaseDimension(props.factLinkComponent), 
                                ] }
                            />
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
                                    renderRelatedFact(fact, corpus, this.props.factLinkComponent)
                            ) 
                        }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    }
}
