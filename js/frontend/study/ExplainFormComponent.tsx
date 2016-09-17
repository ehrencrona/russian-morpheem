

import { Component, createElement } from 'react'
import Corpus from '../../shared/Corpus'

import InflectionsContainerComponent from '../InflectionsComponent'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import Fact from '../../shared/fact/Fact'
import { Knowledge } from '../../shared/study/Exposure'

import Inflection from '../../shared/inflection/Inflection'
import Ending from '../../shared/Ending'
import { getFormName } from '../../shared/inflection/InflectionForms' 
import InflectionFact from '../../shared/inflection/InflectionFact'
import NaiveKnowledge from '../../shared/study/NaiveKnowledge'
import Transform from '../../shared/Transform'
import { EndingTransform } from '../../shared/Transforms'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    word: InflectedWord,
    knowledge: NaiveKnowledge,
    onClose: () => void
    onSelect: (word: InflectedWord) => void
}

enum Tab {
    FORM, INFLECTION
}

interface State {
    tab: Tab
}

export default class ExplainFormComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = { tab: Tab.FORM }
    }

    getExamplesUsingInflection(form: string, inflection: Inflection) {
        let corpus = this.props.corpus

        let inflectionIds = new Set()

        let inflectionId = inflection.getInflectionId(form) 

        corpus.inflections.inflections.forEach((potentialChild) => {
            if (potentialChild.pos == inflection.pos &&
                potentialChild.getInflectionId(form) == inflectionId) {
                inflectionIds.add(potentialChild.id)
            }
        })

        let known: InflectableWord[] = []

        let foundByStem = new Set<string>()

        let facts = corpus.facts.facts

        for (let i = 0; i < facts.length; i++) {
            let fact = facts[i]
            
            if (fact instanceof InflectableWord && 
                !!fact.inflect(form) &&
                fact !== this.props.word.word &&
                !foundByStem.has(fact.toText()) && 
                inflectionIds.has(fact.inflection.id)) {
                let list: InflectableWord[]

                foundByStem.add(fact.toText())

                let knowledge = this.props.knowledge.getKnowledge(fact)

                if (knowledge == Knowledge.KNEW) {
                    known.push(fact)
                }
            }
        }

        return known
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

    showHowInflectionFormsForm(word: InflectableWord, transforms: Transform[]) {
        let inflected = word.inflect(this.props.word.form)

        let transform = getTransform(inflected)

        if (transform && !transforms.find((t) => t.getId() == transform.id)) {
            transforms.push(transform)
        }

        return <li key={ word.getId() }>{ word.getDefaultInflection().jp } →&nbsp; 
            <span className='clickable' onClick={ () => this.props.onSelect(inflected) }>
                { inflected.toString() }{ transform ? '*' : '' }
            </span> </li>
    }

    describeFormation(word: InflectedWord, transforms: Transform[]) {
        let inflection = word.word.inflection
        let form = word.form
        let ending = inflection.getEnding(form)
        let fromForm: string = ending.relativeTo || inflection.defaultForm
        let fromEnding = inflection.getEnding(fromForm)
        let fromWord = word.word.inflect(fromForm)

        let transform = getTransform(word)

        if (transform && !transforms.find((t) => t.getId() == transform.id)) {
            transforms.push(transform)
        }

        if (fromForm == form) {
            return <p>
                <strong>
                    { word.word.getDefaultInflection().jp }
                </strong> is the <strong>
                    { getFormName(form) }
                </strong> form, which is the basic form of the word. You will find it listed under this form in dictionaries. 
            </p>
        }

        return <div>
            { (!ending.relativeTo && fromEnding.suffix == ending.suffix) ||
                (ending.relativeTo && !ending.suffix) ?

                <p>
                    <strong>
                        { word.word.getDefaultInflection().jp }
                    </strong> in the <strong>
                        { getFormName(form) }
                    </strong> is identical to the <strong>
                        { getFormName(fromForm) }
                    </strong>.
                </p>

                :

                <p>
                    <strong>
                        { word.word.getDefaultInflection().jp }
                    </strong> forms the <strong>
                        { getFormName(form) }
                    </strong> from the <strong>
                        { getFormName(fromForm) }
                    </strong> 
                    
                    {
                        ending.relativeTo ?
                        ' (' + word.word.inflect(fromForm).jp + ')':
                        ''
                    } by 
                    
                    { !ending.relativeTo ?
                    
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
                    }
                    {' '}to give <strong>
                        { word.jp }{ transform ? '*' : '' }
                    </strong>.
                </p>

            }

        </div>
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

        return <div>
                <div> 
                    {
                        this.describeFormation(word, transforms)
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
                                            this.showHowInflectionFormsForm(word, transforms))
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
                                            this.showHowInflectionFormsForm(word, transforms))          
                                    }
                                </ul>
                            </div>
                            :
                            <div/>
                    }
                </div>

                {

                    this.filterInflectionsByKnowledge(this.sortInflectionsByDistance(word.word.inflection), form)
                        .filter((inflection) => this.getExamplesUsingInflection(word.form, inflection).length > 1)
                        .slice(0, 2)
                        .map((inflection) => 
                        <div key={ inflection.id }>
                            <p>
                                Compare this to { inflection.description ? 'most ' + inflection.description : 'these words' }, that work differently:
                            </p>

                            <ul>
                                {
                                    this.getExamplesUsingInflection(word.form, inflection)
                                        .slice(0, 2)
                                        .map((word) => this.showHowInflectionFormsForm(word, transforms))
                                }
                            </ul>

                        </div>
                    )

                }

                <div>
                {
                    ending.relativeTo ? 
                        this.describeFormation(word.word.inflect(ending.relativeTo), transforms)
                        :
                        <div/>
                }
                </div>

                {
                    this.getHomonymForms().length ? 

                    <p>

                        <strong>{ word.jp }</strong> is also the <strong>{
                            joinWithAnd(this.getHomonymForms().map(getFormName))
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
            </div>
    }

    renderInflection() {

        return <InflectionsContainerComponent 
            corpus={ this.props.corpus}
            word={ this.props.word.word }
            allowAdd={ false }
            inflection={ this.props.word.word.inflection } 
            onSelect={ (form) => this.props.onSelect(this.props.word.word.inflect(form)) }/>

    }

    render() {
        let word = this.props.word
        let form = word.form
        let inflection = word.word.inflection
        let corpus = this.props.corpus

        return <div className='overlayContainer' onClick={ this.props.onClose }>

            <div className='overlay'>
                <div>
                    <div className='tabs'>
                        <div className={ 'tab' + (this.state.tab == Tab.FORM ? ' current' : '') } 
                                onClick={ () => this.setState({ tab: Tab.FORM }) }>
                            <h3>The { getFormName(form) }</h3>
                        </div>
                        <div className={ 'tab' + (this.state.tab == Tab.INFLECTION ? ' current' : '') } 
                                onClick={ () => this.setState({ tab: Tab.INFLECTION }) }>
                            <h3>{ word.getDefaultInflection().jp }</h3>
                        </div>
                    </div>

                    { this.state.tab == Tab.FORM ?

                        this.renderForm() 
                    
                        :
                    
                        this.renderInflection()}

                    <div className='buttonBar'>

                        <div className='button' onClick={ (e) => { e.stopPropagation(); this.props.onClose() } } > Close </div>

                    </div>
                </div>

            </div>

        </div>

    }
}

function capitalize(str: string) {
    return str[0].toUpperCase() + str.substr(1)
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
