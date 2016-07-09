/// <reference path="../../../typings/react/react.d.ts" />

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'

import Inflection from '../../shared/inflection/Inflection'
import Ending from '../../shared/Ending'
import { getFormName } from '../../shared/inflection/InflectionForms' 
import InflectionFact from '../../shared/inflection/InflectionFact'
import LeitnerKnowledge from '../../shared/study/LeitnerKnowledge'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    word: InflectedWord,
    knowledge: LeitnerKnowledge,
    onClose: () => void
}

interface State {}

export default class ExplainFormComponent extends Component<Props, State> {
    getExamples(form: string, inflection: Inflection) {
        let corpus = this.props.corpus

        let inflectionIds = new Set()

        let inflectionId = inflection.getInflectionId(form) 

        corpus.inflections.inflections.forEach((potentialChild) => {
            if (potentialChild.pos == inflection.pos &&
                potentialChild.getInflectionId(form) == inflectionId) {
                inflectionIds.add(potentialChild.id)
            }
        })

        let known: InflectableWord[] = [], studying: InflectableWord[] = [], unknown: InflectableWord[] = [], trivial: InflectableWord[] = []

        let facts = corpus.facts.facts

        for (let i = 0; i < facts.length; i++) {
            let fact = facts[i]
            
            if (fact instanceof InflectableWord && 
                !!fact.inflect(form) &&
                inflectionIds.has(fact.inflection.id)) {
                let list: InflectableWord[]

                if (this.props.knowledge.isKnown(fact)) {
                    list = known
                }
                else if (this.props.knowledge.isTrivial(fact)) {
                    list = trivial
                }
                else if (this.props.knowledge.isStudying(fact)) {
                    list = known
                }
                else {
                    list = unknown
                }

                list.push(fact)
            }
        }

        return studying.concat(known).concat(trivial).concat(unknown)
    }

    getHomonymForms() {
        let homonyms = this.props.corpus.words.ambiguousForms[this.props.word.jp]

        if (homonyms) {
            return homonyms.slice(0).filter((w) => w !== this.props.word)
                .filter((w) => w instanceof InflectedWord && w.word === this.props.word.word)
                .map((w) => (w as InflectedWord).form)
        }
        else {
            return []
        }
    }

    getOtherInflectionsDefiningForm() {
        let corpus = this.props.corpus
        let inflection = this.props.word.word.inflection
        let form = this.props.word.form

        let result: Inflection[] = []

        let wordInflectionId = this.props.word.word.inflection.getInflectionId(form) 

        corpus.inflections.inflections.forEach((candidate) => {
            if (candidate !== inflection && 
                candidate.pos == this.props.word.word.inflection.pos &&
                candidate.id != wordInflectionId &&
                !!candidate.endings[form]) {
                result.push(candidate)
            }
        })

        return result
    }

    sortInflectionsByDistance(from: Inflection) {

        let distance: { [id:string]: number } = {}

        distance[from.id] = 0

        let foundAny 

        let inflections = this.props.corpus.inflections 

        do {
            foundAny = false

            inflections.inflections.forEach((candidate) => {

                if (distance[candidate.id] != null) {
                    candidate.inherits.forEach((parent) => {
                        if (distance[parent.id] == null) {
                            distance[parent.id] = distance[candidate.id] + 1
                            foundAny = true
                        }
                    })
                }
                else {
                    candidate.inherits.forEach((parent) => {
                        if (distance[parent.id] != null) {
                            foundAny = true
                            distance[candidate.id] = distance[parent.id] + 1
                        }
                    })
                }

            })
        }
        while (foundAny)
        
        delete distance[from.id]
        delete distance[this.props.word.word.inflection.getInflectionId(this.props.word.form)] 

        return Object.keys(distance).sort((k1, k2) => distance[k1] - distance[k2]).map((id) => inflections.get(id))
            .filter((i) => !!i.endings[this.props.word.form])
    }

    sortInflectionsByKnowledge(inflections: Inflection[], form: string) {
        let known = [], unknown = []

        inflections.forEach((inflection) => {
            let fact = inflection.getFact(form) 
            if (this.props.knowledge.isKnown(fact) || this.props.knowledge.isStudying(fact)) {
                known.push(inflection)
            }
            else {
                unknown.push(inflection)
            }
        })

        return known.concat(unknown)
    }

    examplesOfInflection(inflection: Inflection) {
        return  <ul>

                {

                    this.getExamples(this.props.word.form, inflection)
                        .filter((w) => w !== this.props.word.word).slice(0, 3).map((word) =>
                    
                        <li key={ word.getId() }>{ word.getDefaultInflection().jp } → { word.inflect(this.props.word.form).toString() }</li>
                    
                    )

                }

            </ul> 
    }

    render() {
        let form = this.props.word.form

        return <div className='overlayContainer'>

            <div className='overlay'>

                {   this.getHomonymForms().length ? 

                    <p>

                        <strong>{ this.props.word.jp }</strong> is also the 

                        {
                            ' ' + this.getHomonymForms().map(getFormName).join(', ') + ' '
                        }

                        of <strong>{ this.props.word.word.getDefaultInflection().jp }</strong>.

                    </p>

                    : 

                    <div/>

                }


                <div>
                    <p>
                        <strong>{ this.props.word.jp }</strong> forms the  
                        <strong>{ ' ' + getFormName(form) + ' '}</strong> in the same way as:
                    </p>

                    {
                        this.examplesOfInflection(this.props.word.word.inflection)
                    }
                
                </div>

                {

                    this.sortInflectionsByKnowledge(this.sortInflectionsByDistance(this.props.word.word.inflection).slice(0, 3), form)
                        .filter((inflection) => this.getExamples(this.props.word.form, inflection).length > 1)
                        .map((inflection) => 
                        <div key={ inflection.id }>
                            <p>
                                Compare the following way of forming the   
                                <strong>{ ' ' + getFormName(form) + ' '}</strong>:
                            </p>

                            {
                                this.examplesOfInflection(inflection)
                            }
                        
                        </div>
                    )

                }

                <div className='buttonBar'>

                    <div className='button' onClick={ this.props.onClose } > Close </div>

                </div>

            </div>

        </div>

    }
}