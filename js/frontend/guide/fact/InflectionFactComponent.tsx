

import { Component, createElement } from 'react'
import Corpus from '../../../shared/Corpus'

import { Knowledge } from '../../../shared/study/Exposure'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'

import Inflection from '../../../shared/inflection/Inflection'
import { FORMS } from '../../../shared/inflection/InflectionForms' 
import InflectionFact from '../../../shared/inflection/InflectionFact'

import InflectedWord from '../../../shared/InflectedWord'
import InflectableWord from '../../../shared/InflectableWord'

import Fact from '../../../shared/fact/Fact'

import { EndingTransform } from '../../../shared/Transforms'
import AnyWord from '../../../shared/AnyWord'
import Transform from '../../../shared/Transform'
import Ending from '../../../shared/Ending'

import getExamplesUsingInflection from './getExamplesUsingInflection'
import renderRelatedFact from './renderRelatedFact'
import capitalize from './capitalize'

import InflectionTableComponent from '../../inflection/InflectionTableComponent'

import StudyFact from '../../study/StudyFact'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    word: InflectedWord,
    knowledge: NaiveKnowledge,
    onSelectFact: (fact: Fact, context?: InflectedWord) => any
}

interface State {
}

/** Explains how a certain ending is formed for an inflection fact */
export default class InflectionFactComponent extends Component<Props, State> {
    constructor(props) {
        super(props)
    }

    filterOnlySameDefaultSuffix(words: InflectableWord[], form: string, inflection: Inflection) {
        let inflectionId = inflection.getInflectionId(form) 

        let defaultSuffix = inflection.getEnding(inflection.defaultForm).suffix
        return words.filter((word) => word.inflection.getEnding(word.inflection.defaultForm).suffix == defaultSuffix)
    }

    filterOnlyDifferentDefaultSuffix(words: InflectableWord[], form: string, inflection: Inflection) {
        let inflectionId = inflection.getInflectionId(form) 
        let allDefaultSuffixes = 
            new Set(words.map((w) =>{
                return w.inflection.getEnding(w.inflection.defaultForm).suffix
            } ))  

        allDefaultSuffixes.delete(inflection.getEnding(inflection.defaultForm).suffix)

        // only one example of each default suffix
        return words.filter((word) => {
            let defaultSuffix = word.inflection.getEnding(word.inflection.defaultForm).suffix

            if (allDefaultSuffixes.has(defaultSuffix)) {
                allDefaultSuffixes.delete(defaultSuffix)

                return true
            }
            else {
                return false
            }
        })
    }

    getHomonymForms() {
        let homonyms = this.props.corpus.words.ambiguousForms[this.props.word.jp]

        let word = this.props.word
        let ending = word.word.inflection.getEnding(word.form)
        
        if (homonyms) {
            return homonyms.slice(0).filter((w) => w !== this.props.word)
                .filter((w) => w instanceof InflectedWord && w.word === this.props.word.word)
                .filter((w: InflectedWord) => w.form != ending.relativeTo)
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

    filterInflectionsByKnowledge(inflections: Inflection[], form: string) {
        let known = []

        inflections.forEach((inflection) => {
            let fact = inflection.getFact(form) 

            if (this.props.knowledge.getKnowledge(fact) == Knowledge.KNEW) {
                known.push(inflection)
            }
        })

        return known
    }

    renderStemToInflected(word: InflectableWord, transforms?: Transform[]) {
        return renderStemToInflected(word, this.props.word.form, this.props.onSelectFact, transforms)
    }

    renderFormName(form: string): any {
        let name = FORMS[form].name
        let fact = this.props.corpus.facts.get(name)

        if (fact) {
            return <span className='form clickable' 
                onClick={ () => this.props.onSelectFact(FORMS[form]) }>{ name }</span>
        }
        else {
            return name
        }
    }

    describeFormation(wordComponent, word: InflectedWord, transforms: Transform[]) {
        let inflection = word.word.inflection
        let form = word.form
        let ending = inflection.getEnding(form)

        let relativeTo = ending.relativeTo

        if (relativeTo && !word.word.inflect(relativeTo)) {
            relativeTo = null
        }

        let fromForm: string = relativeTo || inflection.defaultForm
        let fromEnding = inflection.getEnding(fromForm)
        let fromWord = word.word.inflect(fromForm)

        let transform = getTransform(word)

        if (transform && !transforms.find((t) => t.getId() == transform.id)) {
            transforms.push(transform)
        }

        if (fromForm == form) {
            return <p>
                { wordComponent } is the <strong>
                    { this.renderFormName(form) }
                </strong> form, which is the basic form of the word. You will find it listed under this form in dictionaries. 
            </p>
        }

        return <div>
            { (!relativeTo && fromEnding.suffix == ending.suffix) ||
                (relativeTo && !ending.suffix) ?

                <p>
                    { wordComponent } in the <strong>
                        { this.renderFormName(form) }
                    </strong> is identical to the <strong>
                        { this.renderFormName(fromForm) }
                    </strong>.
                </p>

                :

                <p>
                    { wordComponent } forms the <strong>
                        { this.renderFormName(form) }
                    </strong> from the <strong>
                        { this.renderFormName(fromForm) }
                    </strong> 

                    {
                        relativeTo ?
                        ' (' + word.word.inflect(fromForm).jp + ')':
                        ''
                    } by 
                    
                    { !relativeTo ?
                    
                        <span> replacing <strong>
                                { (ending.subtractFromStem ? word.word.stem.substr(-ending.subtractFromStem) : '') + fromEnding.suffix }
                            </strong> with <strong>
                                { ending.suffix }
                            </strong>
                        </span>

                        :

                        (ending.subtractFromStem > 0 ? 
                            <span> replacing <strong>
                                    { fromWord.jp.substr(-ending.subtractFromStem) }
                                </strong> with <strong>
                                    { ending.suffix }
                                </strong>
                            </span>
                            :
                            <span> adding <strong>
                                    { ending.suffix }
                                </strong>
                            </span>
                        )
                    } to give <strong>
                        { word.jp }{ transform ? '*' : '' }
                    </strong>.
                </p>

            }

        </div>
    }

    getExamplesUsingInflection(form: string, inflection: Inflection, count?: number) {
        return getExamplesUsingInflection(form, inflection, this.props.corpus, this.props.knowledge, this.props.word, count)
    }

    renderForm() {
        let word = this.props.word
        let form = word.form
        let inflection = word.word.inflection
        let corpus = this.props.corpus

        let otherExamplesOfInflection = 
            this.getExamplesUsingInflection(this.props.word.form, inflection)

        let sameDefaultSuffix = 
            this.filterOnlySameDefaultSuffix(otherExamplesOfInflection, this.props.word.form, inflection)

        let differentDefaultSuffix = 
            this.filterOnlyDifferentDefaultSuffix(otherExamplesOfInflection, this.props.word.form, inflection)

        let inflectionOfForm = corpus.inflections.get(inflection.getInflectionId(form))

        let differentDefault

        let transforms = []

        let ending = inflection.getEnding(form)

        return <div className='inflection fact'>
                <h3>Formation</h3>

                <div>
                    {
                        this.describeFormation(
                            <span className='clickable' onClick={ () => this.props.onSelectFact(word.word) }>
                                <strong>{ word.word.getDefaultInflection().jp }</strong> ("{ word.word.getEnglish() }")
                            </span>,
                            word, transforms)
                    }
                </div>

                <div>
                {
                    ending.relativeTo ? 
                        this.describeFormation(<span>It</span>, word.word.inflect(ending.relativeTo), transforms)
                        :
                        <div/>
                }
                </div>

                <div>
                    {
                        sameDefaultSuffix.length ?
                            <div>
                                <p>
                                    { inflectionOfForm.description ? 'Most ' + inflectionOfForm.description : 'These words' } 
                                    { form == word.word.inflection.defaultForm ? ' have the same ending' : ' work the same way' }:
                                </p>

                                <ul>
                                    {
                                        sameDefaultSuffix.slice(0, 3).map((word) => 
                                            this.renderStemToInflected(word, transforms))
                                    }
                                </ul>
                            </div>
                            :
                            <div/>
                    }
                
                </div>

                <div>                
                    {
                        differentDefaultSuffix.length ?
                            <div>
                                <p>
                                    The following words work the same way, but starting from different stems:
                                </p>

                                <ul>
                                    {
                                        differentDefaultSuffix.slice(0, 3).map((word) => 
                                            this.renderStemToInflected(word, transforms))          
                                    }
                                </ul>
                            </div>
                            :
                            <div/>
                    }
                </div>

                {

                    this.filterInflectionsByKnowledge(this.sortInflectionsByDistance(word.word.inflection), form)
                        .filter((inflection) => this.getExamplesUsingInflection(word.form, inflection, 2).length > 1)
                        .slice(0, 2)
                        .map((inflection) => 
                        <div key={ inflection.id }>
                            <p>
                                Compare this to { inflection.description ? 'most ' + inflection.description : 'these words' }, that work differently:
                            </p>

                            <ul>
                                {
                                    this.getExamplesUsingInflection(word.form, inflection, 2)
                                        .slice(0, 2)
                                        .map((word) => this.renderStemToInflected(word, transforms))
                                }
                            </ul>

                        </div>
                    )

                }

                {
                    this.getHomonymForms().length ? 

                    <p>

                        <strong>{ word.jp }</strong> is also the <strong>{
                            joinWithAnd(this.getHomonymForms().map((form) => FORMS[form].name))
                        }</strong> form.

                    </p>

                    : 

                    <div/>
                }

                {

                    transforms.length ?

                    transforms.map((transform) => 
                        <div> 
                            *) <strong>
                                { transform.from }
                            </strong> is replaced with <strong>
                                { transform.to }
                            </strong> after <strong>
                                { transform.after.split('').join(', ') }
                            </strong>
                        </div>
                    )

                    :

                    <div/>
                }

                <h3>Forms</h3>

                <InflectionTableComponent
                    corpus={ this.props.corpus }
                    inflection={ word.word.inflection }
                    word={ word.word }
                    onSelectFact={ this.props.onSelectFact }
                    renderForm={ (inflectedWord, form, factIndex) => {
                        return <div className='clickable' key={ form } onClick={ () => { 
                                this.props.onSelectFact(word.word.inflection.getFact(form), 
                                    word.word.inflect(form)) 
                            } }>{ 
                                word.word.inflect(form).jp 
                            }</div>
                    }}
                    />
            </div>
    }

    render() {
        let word = this.props.word
        let form = word.form
        let inflection = word.word.inflection
        let corpus = this.props.corpus

        let components = FORMS[form].getComponents()

        let inflectionFact = inflection.getFact(this.props.word.form)
        let related = (inflectionFact.required || []).concat(components)

        return <div className='inflectionFact'>
            <h1>The { this.renderFormName(form) }</h1>

            <h2 className='clickable' onClick={ () => this.props.onSelectFact(word.getWordFact()) }>{ 
                word.getDefaultInflection().jp 
            }</h2>

            <div className='columns'>
                <div className='main'>
                    { this.renderForm() }
                </div>
                {
                    related.length ?
                    <div className='sidebar'>
                        <div>
                            <h3>See also</h3>

                            <ul>
                                {                             
                                    related.map(fact =>     
                                        renderRelatedFact(fact, corpus, this.props.onSelectFact)) 
                                }
                            </ul>
                        </div>
                    </div>
                    :
                    null
                }
            </div>
        </div>
    }
}

export function renderStemToInflected(word: InflectableWord, form: string, 
        onSelectFact: (fact: Fact, context: InflectedWord) => any, transforms?: Transform[]) {
    let inflected = word.inflect(form)
    let transform

    if (transforms) {
        transform = getTransform(inflected)

        if (transform && !transforms.find((t) => t.getId() == transform.id)) {
            transforms.push(transform)
        }
    }

    return <li className='stemToInflected' key={ word.getId() }>
        <span className='clickable' onClick={ (e) => {
                e.stopPropagation()  
                onSelectFact( 
                    word.getWordFact(), inflected) }}>{ 
            word.getDefaultInflection().jp }</span>&nbsp;<span className='arrow'>
            →
        </span> <span className='clickable' onClick={ (e) => {
                e.stopPropagation()  
                onSelectFact( 
                    inflected.word.inflection.getFact(inflected.form), 
                    inflected) }}>
            { inflected.toString() }{ transform ? '*' : '' }
        </span> </li>
}

function joinWithAnd(arr: string[]) {
    if (!arr.length) {
        return ''
    }
    else if (arr.length == 1) {
        return arr[0]
    }
    else {
        return arr.slice(0, arr.length-1).join(', ') + ' and ' + arr[arr.length-1]
    }
}

function getTransform(fact: Fact) {
    let result

    fact.visitFacts((fact) => {
        if (fact instanceof EndingTransform) {
            result = fact 
        }
    })

    return result
}
