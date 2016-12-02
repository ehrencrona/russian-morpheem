import { PivotDimension } from '../pivot/PivotDimension';
import { Match } from '../../phrase/Match';


import { Component, createElement } from 'react'
import Corpus from '../../../shared/Corpus'

import { Knowledge } from '../../../shared/study/Exposure'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import topScores from '../../../shared/study/topScores'
import toStudyWords from '../../study/toStudyWords'
import SentenceScore from '../../../shared/study/SentenceScore'

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

import { renderWordInflection } from '../InflectionTableComponent'
import InflectionTableComponent from '../InflectionTableComponent'
import FactLinkComponent from './FactLinkComponent'

import { FactPivotTable, renderFactEntry } from '../pivot/PivotTableComponent'
import PhrasePrepositionDimension from '../pivot/PhrasePrepositionDimension'
import GroupedListComponent from '../pivot/GroupedListComponent'
import { MatchPhraseDimension, MatchTextDimension } from '../pivot/MatchTextDimension'
import MatchEndingDimension from '../pivot/MatchEndingDimension'

import { getMatchesForInflectionFact, renderMatch, 
    TokenizedSentence, downscoreRepeatedWord, 
        tokensToHtml, highlightTranslation } from './exampleSentences'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    inflection: InflectionFact
    word?: InflectedWord,
    knowledge: NaiveKnowledge,
    factLinkComponent: FactLinkComponent
}

interface State {
}

/** Explains how a certain ending is formed for a certain word (an inflection fact) */
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

    getHomonymForms(word: InflectedWord) {
        let homonyms = this.props.corpus.words.ambiguousForms[word.jp]

        let ending = word.word.inflection.getEnding(word.form)
        
        if (homonyms) {
            return homonyms.slice(0).filter((w) => w !== word)
                .filter((w) => w instanceof InflectedWord && w.word === word.word)
                .filter((w: InflectedWord) => w.form != ending.relativeTo)
                .map((w) => (w as InflectedWord).form)
        }
        else {
            return []
        }
    }

    getOtherInflectionsDefiningForm(word: InflectedWord) {
        let corpus = this.props.corpus
        let inflection = word.word.inflection
        let form = word.form

        let result: Inflection[] = []

        let wordInflectionId = word.word.inflection.getInflectionId(form) 

        corpus.inflections.inflections.forEach((candidate) => {
            if (candidate !== inflection && 
                candidate.wordForm.pos == word.word.inflection.wordForm.pos &&
                candidate.id != wordInflectionId &&
                !!candidate.endings[form]) {
                result.push(candidate)
            }
        })

        return result
    }

    sortInflectionsByDistance(from: Inflection, word: InflectedWord) {
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
        delete distance[word.word.inflection.getInflectionId(word.form)] 

        return Object.keys(distance).sort((k1, k2) => distance[k1] - distance[k2]).map((id) => inflections.get(id))
            .filter((i) => !!i.endings[word.form])
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

    renderStemToInflected(word: InflectableWord, inflectedWord: InflectedWord, transforms?: Transform[]) {
        return renderStemToInflected(word, inflectedWord.form, this.props.factLinkComponent, transforms)
    }

    renderFormName(form: string): any {
        let name = FORMS[form].name
        let fact = this.props.corpus.facts.get(name)

        if (fact) {
            return <span className='form clickable'>{
                React.createElement(this.props.factLinkComponent, 
                    { fact: FORMS[form] }, 
                    name)
            }</span>
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
                    
                        (!ending.subtractFromStem && !fromEnding.suffix ?
                            <span> adding <strong>{ ending.suffix }</strong>
                            </span>
                            :
                            <span> replacing <strong>
                                    { (ending.subtractFromStem ? word.word.stem.substr(-ending.subtractFromStem) : '') + fromEnding.suffix }
                                </strong> with <strong>
                                    { ending.suffix }
                                </strong>
                            </span>)

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

    getExamplesUsingInflection(form: string, inflection: Inflection, inflectedWord: InflectedWord, count?: number) {
        let inflectedId = inflectedWord.word.getId()
        
        return getExamplesUsingInflection(form, inflection, this.props.corpus, this.props.knowledge, 
            (word) => word.getId() != inflectedId, count)
    }

    renderForm(word: InflectedWord) {
        let form = word.form
        let inflection = word.word.inflection
        let corpus = this.props.corpus

        let otherExamplesOfInflection = 
            this.getExamplesUsingInflection(form, inflection, word)

        let sameDefaultSuffix = 
            this.filterOnlySameDefaultSuffix(otherExamplesOfInflection, form, inflection)

        let differentDefaultSuffix = 
            this.filterOnlyDifferentDefaultSuffix(otherExamplesOfInflection, form, inflection)

        let inflectionOfForm = corpus.inflections.get(inflection.getInflectionId(form))

        let differentDefault

        let transforms = []

        let ending = inflection.getEnding(form)
        let relativeToWord = ending.relativeTo && word.word.inflect(ending.relativeTo)

        return <div className='inflection fact'>
                <h3>Formation</h3>

                <div>
                    {
                        this.describeFormation(
                            <span className='clickable'>{
                                React.createElement(this.props.factLinkComponent, 
                                    { fact: word.word }, 
                                    <span><strong>{ word.word.getDefaultInflection().jp }</strong> ("{ word.word.getEnglish() }")</span>
                                )
                            }
                            </span>,
                            word, transforms)
                    }
                </div>

                <div>
                {
                    relativeToWord ? 
                        this.describeFormation(<span>It</span>, relativeToWord, transforms)
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
                                        sameDefaultSuffix.slice(0, 7).map((otherWord) => 
                                            this.renderStemToInflected(otherWord, word, transforms))
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
                                        differentDefaultSuffix.slice(0, 3).map((otherWord) => 
                                            this.renderStemToInflected(otherWord, word, transforms))          
                                    }
                                </ul>
                            </div>
                            :
                            <div/>
                    }
                </div>

                {

                    this.filterInflectionsByKnowledge(this.sortInflectionsByDistance(word.word.inflection, word), form)
                        .filter((inflection) => this.getExamplesUsingInflection(word.form, inflection, word, 2).length > 1)
                        .slice(0, 2)
                        .map((inflection) => 
                        <div key={ inflection.id }>
                            <p>
                                Compare this to { inflection.description ? 'most ' + inflection.description : 'these words' }, that work differently:
                            </p>

                            <ul>
                                {
                                    this.getExamplesUsingInflection(word.form, inflection, word, 2)
                                        .slice(0, 2)
                                        .map((otherWord) => this.renderStemToInflected(otherWord, word, transforms))
                                }
                            </ul>

                        </div>
                    )

                }

                {
                    this.getHomonymForms(word).length ? 

                    <p>

                        <strong>{ word.jp }</strong> is also the <strong>{
                            joinWithAnd(this.getHomonymForms(word).map((form) => FORMS[form].name))
                        }</strong> form.

                    </p>

                    : 

                    <div/>
                }

                {

                    transforms.length ?

                    transforms.map((transform) => 
                        <div key={ transform.from + transform.to } > 
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
                    pos={ word.wordForm.pos  }
                    mask={ word.word.mask }
                    factLinkComponent={ this.props.factLinkComponent }
                    renderForm={ renderWordInflection(word.word, this.props.corpus, 
                        (inflectedWord, form, factIndex) => {
                            return <div className='clickable' key={ form }>{
                                React.createElement(this.props.factLinkComponent, 
                                    { 
                                        fact: word.word.inflection.getFact(form),
                                        context: word
                                    }, 
                                    word.word.inflect(form).jp)
                            }</div>
                        })
                    }
                    />
            </div>
    }

    getSentences(fact: InflectionFact) {
        let corpus = this.props.corpus

        let matches = getMatchesForInflectionFact(fact, this.props.knowledge, corpus)

        class MatchListComponent extends GroupedListComponent<Match> {
        }

        let dimensions = [ new MatchTextDimension(true) ]

        return <MatchListComponent
            data={ matches }
            getIdOfEntry={ (match) => match.sentence.id }
            dimensions={ dimensions }
            renderEntry={ renderMatch(fact, corpus, this.props.factLinkComponent) }
            renderGroup={ (entry, children, key) => <div key={ key }>
                { entry }
                <ul className='sentences'>{ children }</ul>
            </div> }
            itemsPerGroupLimit={ 3 }
            groupLimit={ 10 }
        />   
    }

    render() {
        let corpus = this.props.corpus
        let word = this.props.word

        let inflection = this.props.inflection.inflection

        if (!word) {
            let form = this.props.inflection.form

            let inflectable = getExamplesUsingInflection(form, inflection, 
                this.props.corpus, this.props.knowledge, null, 1)[0]

            if (inflectable) {
                word = inflectable.inflect(form)
            }

            if (!word) {
                console.warn('Found no word with inflection ' + inflection.getId()) 
                return <div/>
            }
        }

        let form = word.form

        let components = FORMS[form].getComponents()

        let inflectionFact = inflection.getFact(form)
        
        let related = (this.props.word ? [ this.props.word.getWordFact() ] : [])
            .concat(inflectionFact.required || [])
            .concat(FORMS[form]).concat(components)

        return <div className='inflectionFact'>
            <h1>The { this.renderFormName(form) }</h1>

            <h2 className='clickable'>{ 
                React.createElement(this.props.factLinkComponent, 
                    { fact: word.word.inflection.getFact(form) }, 
                    word.getDefaultInflection().jp)
            }</h2>

            <div className='columns'>
                <div className='main'>
                    { this.renderForm(word) }

                    <h3>Examples of usage</h3>

                    <div className='exampleSentences'>
                    {
                        this.getSentences(this.props.inflection)
                    }
                    </div>
                </div>
                {
                    related.length ?
                    <div className='sidebar'>
                        <div>
                            <h3>See also</h3>

                            <ul>
                                {                             
                                    related.map(fact =>     
                                        renderRelatedFact(fact, corpus, this.props.factLinkComponent)) 
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
        factLinkComponent: FactLinkComponent, transforms?: Transform[]) {
    let inflected = word.inflect(form)
    let transform

    if (transforms) {
        transform = getTransform(inflected)

        if (transform && !transforms.find((t) => t.getId() == transform.id)) {
            transforms.push(transform)
        }
    }

    return <li className='stemToInflected' key={ word.getId() }>
        <span className='clickable'>{ 
            React.createElement(factLinkComponent, 
                { fact: word.getWordFact() }, 
                word.getDefaultInflection().jp) 
            }</span>&nbsp;<span className='arrow'>
            →
        </span> <span className='clickable'>{ 
            React.createElement(factLinkComponent, 
                { fact: inflected.word.inflection.getFact(inflected.form), context: inflected }, 
                inflected.toString() + (transform ? '*' : '')) 
        }</span> </li>
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
