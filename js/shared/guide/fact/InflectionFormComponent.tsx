import { PivotDimension } from '../pivot/PivotDimension';
import { POS_LONG_NAMES } from '../../phrase/PhrasePattern';

import { Component, createElement } from 'react'
import Corpus from '../../../shared/Corpus'

import InflectedWord from '../../../shared/InflectedWord'
import InflectableWord from '../../../shared/InflectableWord'

import Fact from '../../../shared/fact/Fact'
import { Knowledge } from '../../../shared/study/Exposure'

import { Factoid } from '../../../shared/metadata/Factoids'
import { getFormName, FORMS, CASES, INFLECTION_FORMS, POSES } from '../../../shared/inflection/InflectionForms'
import { Aspect, PartOfSpeech as PoS, Tense } from '../../../shared/inflection/Dimensions';
import { InflectionForm } from '../../../shared/inflection/InflectionForm'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import topScores from '../../../shared/study/topScores'
import KnowledgeSentenceSelector from '../../../shared/study/KnowledgeSentenceSelector'
import toStudyWords from '../../study/toStudyWords'
import Sentence from '../../Sentence'
import SentenceScore from '../../../shared/study/SentenceScore'

import WordInFormMatch from '../../../shared/phrase/WordInFormMatch'
import PhraseMatch from '../../../shared/phrase/PhraseMatch'
import Phrase from '../../../shared/phrase/Phrase'
import Match from '../../../shared/phrase/Match'

import Transform from '../../../shared/Transform'
import { EndingTransform } from '../../../shared/Transforms'

import renderRelatedFact from './renderRelatedFact'
import capitalize from './capitalize'

import StudyFact from '../../study/StudyFact'
import getExamplesUsingInflection from './getExamplesUsingInflection'
import { renderStemToInflected } from './InflectionFactComponent'
import FactLinkComponent from './FactLinkComponent'
import { TokenizedSentence, downscoreRepeatedWord, tokensToHtml, getFilterPhrasesForInflectionForm,
    highlightTranslation, getMatchesForInflectionForm, renderMatch } from './exampleSentences'

import { FactPivotTable, renderFactEntry } from '../pivot/PivotTableComponent'
import PhrasePrepositionDimension from '../pivot/PhrasePrepositionDimension'
import MatchGenderDimension from '../pivot/MatchGenderDimension'
import GroupedListComponent from '../pivot/GroupedListComponent'
import { MatchPhraseDimension, MatchTextDimension } from '../pivot/MatchTextDimension'
import MatchEndingDimension from '../pivot/MatchEndingDimension'

import { renderFormName, InflectionTableComponent } from '../InflectionTableComponent'

import marked = require('marked')

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    form: InflectionForm,
    knowledge: NaiveKnowledge,
    factLinkComponent: FactLinkComponent
}

interface State {
    allFormations?: boolean,
    allPhrases?: boolean
}

/** Gives general information about a inflection form that matches several more specific forms (typically a case) */
export default class InflectionFormComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = {}
    }

    findPhrasesWithForm() {
        let corpus = this.props.corpus
        let form = this.props.form

        let allPhrases = corpus.phrases.all().filter((phrase) => 
            phrase.patterns.every((pattern) => 
                !!pattern.wordMatches.find((wordMatch) => {
                    let phraseForm = wordMatch.getInflectionForm()

                    return phraseForm && form.matches(phraseForm)
                })
            ))

        let sentencesByFact = this.props.corpus.sentences.getSentencesByFact(this.props.corpus.facts)

        let getCount = (phrase: Phrase) => {
            let sbf = sentencesByFact[phrase.getId()]

            return (sbf ? sbf.count : 0)
        }

        allPhrases.sort((p1, p2) => getCount(p2) - getCount(p1))

        return allPhrases
    }

    mostCommonInflections(formArray: string[], pos: PoS, filter: (fact: InflectableWord) => boolean, count) {
        let wordsByInflection = {}
        let corpus = this.props.corpus

        corpus.facts.facts.forEach(fact => {
            if (fact instanceof InflectableWord 
                && (!filter || filter(fact)) 
                && fact.wordForm.pos == pos 
                && fact.inflection.wordForm.pos == pos) {
                wordsByInflection[fact.inflection.id] = (wordsByInflection[fact.inflection.id] || 0) + 1
            }
        })

        let wordsByInflectionByForm = {}

        for (let form of formArray) {
            wordsByInflectionByForm[form] = {}
        }

        for (let inflectionId in wordsByInflection) {
            let inflection = corpus.inflections.get(inflectionId) 

            for (let form of formArray) {
                let formInflection = inflection.getInflectionId(form)

                if (formInflection) {
                    wordsByInflectionByForm[form][formInflection] = (wordsByInflectionByForm[form][formInflection] || 0) + 
                        wordsByInflection[inflectionId]
                }
            }
        }

        return formArray.map(formId => {
            let form = FORMS[formId]
            let wordsByInflection = wordsByInflectionByForm[formId]

            let inflectionIds = Object.keys(wordsByInflection)
                .sort((form1, form2) => wordsByInflection[form2] - wordsByInflection[form1])

            inflectionIds = inflectionIds.slice(0, count)

            return {
                form: formId,
                inflectionFacts: inflectionIds.map(inflectionId => 
                    corpus.inflections.getInflection(inflectionId).getFact(formId)
                ).filter(f => !!f)
            }
        })
    }

    renderFormation(pos: PoS, forms: string[], filter: (fact: InflectableWord) => boolean, totalFormCount: number) {
        let form = this.props.form

        let count

        if (totalFormCount == 1) {
            count = 6
        }
        else if (totalFormCount < 3) {
            count = 4
        }
        else if (totalFormCount < 10) {
            count = 2
        }
        else if (totalFormCount > 10) {
            count = 1
        }

        if (this.state.allFormations) {
            count = 99
        }

        return <div key={ pos }>
            <div className='posName'>{ capitalize(POS_LONG_NAMES[pos]) }s</div>
            <div className='pos'>
                {
                    this.mostCommonInflections(forms, pos, filter, count).map(i => {
                        let formName = capitalize(FORMS[i.form].name.replace(form.name, '').trim() || 'singular') 

                        let formNameLines = formName.split(' ')

                        return <div key={ i.form } className='form'>
                            <div className='name' >{ 
                                formNameLines.slice(0, formNameLines.length-1).join(' ') 
                            }<br/>{ 
                                formNameLines[formNameLines.length-1] 
                            }</div>
                            <ul className='formation'>
                            {
                                i.inflectionFacts.map(f => {

                                    return <div key={ f.getId() }>{
                                        getExamplesUsingInflection(i.form, f.inflection, this.props.corpus, this.props.knowledge, filter, 1)
                                            .map(w => {
                                                let ending = f.inflection.getEnding(i.form)

                                                return <div key={ i.form }>
                                                    {
                                                        renderStemToInflected(w, i.form, this.props.factLinkComponent)
                                                    }
                                                    {
                                                        ending.relativeTo ?
                                                        <div className='relativeTo'>
                                                            { 
                                                                !ending.subtractFromStem && !ending.suffix ? 'identical to' : 'formed from' 
                                                            } the { 
                                                                FORMS[f.inflection.getEnding(i.form).relativeTo].name
                                                            }
                                                        </div>
                                                        : 
                                                        null
                                                    }
                                                </div>
                                        })
                                    }</div>

                                })
                            }
                            </ul>
                        </div>
                    })
                }
            </div>
        </div>
    }

    getSentences() {
        let corpus = this.props.corpus
        let form = this.props.form

        let filterPhrases = getFilterPhrasesForInflectionForm(form)
        let matches = getMatchesForInflectionForm(filterPhrases, form, this.props.knowledge, corpus)

        class MatchListComponent extends GroupedListComponent<Match> {
        }

        let dimensions: PivotDimension<Match, any>[] = [
            new MatchTextDimension()
        ]

        if (filterPhrases) {
            dimensions = [ new MatchPhraseDimension() ].concat(dimensions)
        }
        else {
            let primaryDimension: PivotDimension<Match, any>

            if (form.id == 'past') {
                primaryDimension = new MatchGenderDimension()
            }
            else {
                primaryDimension = new MatchEndingDimension()                 
            }

            dimensions = [ primaryDimension ].concat(dimensions)
        }

        return <MatchListComponent
            data={ matches }
            getIdOfEntry={ (match) => match.sentence.id }
            dimensions={ dimensions }
            renderEntry={ renderMatch(form, corpus, this.props.factLinkComponent) }
            renderGroup={ (entry, children, key) => <div key={ key }>
                { entry }
                <ul className='sentences'>{ children }</ul>
            </div> }
            itemsPerGroupLimit={ 3 }
            groupLimit={ 10 }
        />   
    }

    getRelatedForms() {
        let thisForm = this.props.form

        return Object.keys(FORMS).map(i => FORMS[i])
            .filter(form => (thisForm.matches(form) || form.matches(thisForm)) && thisForm.id != form.id)
            .map(f => f as Fact)
    }

    render() {
        let corpus = this.props.corpus
        let form = this.props.form

        let factoid = corpus.factoids.getFactoid(form)

        let forms: InflectionForm[] = []

        const POS = [ PoS.NOUN, PoS.ADJECTIVE, PoS.VERB, PoS.PRONOUN ]

        let related = this.getRelatedForms()
            .concat(form.required || [])
            .concat(form.getComponents())
            .concat(
                (factoid ? 
                    factoid.relations.map(f => corpus.facts.get(f.fact)).filter(f => !!f) : []))

        let sentences = this.getSentences()

        let title = corpus.factoids.getFactoid(form).name || ('The ' + form.name)

        let formationExists = !!POS.find(pos => 
            !!INFLECTION_FORMS[pos].allForms
                .find(oneForm => 
                    form.matches(FORMS[oneForm]) && oneForm.indexOf('alt') < 0))

        let isCase = form.isCase()

        let phrases = (isCase || form.id == 'short' || form.id == 'comp') && this.findPhrasesWithForm()

        let poses
        
        if (form.pos) {
            // inf needs this.
            poses = [ form.pos ]
        }
        else {
            poses = [ PoS.NOUN, PoS.ADJECTIVE, PoS.VERB ].filter(pos => 
                !!INFLECTION_FORMS[pos].allForms
                    .find(oneForm => form.equals(FORMS[oneForm])))
        }

        let filter

        if (form.equals({ tense: Tense.PRESENT, pos: PoS.VERB })) {
            filter = (fact: InflectableWord) => 
                 fact.wordForm.aspect != Aspect.PERFECTIVE
        }

        let showExamples = form.id != 'present'

        let getForms = (pos: PoS) =>
            INFLECTION_FORMS[pos].allForms
                .filter(oneForm => 
                    form.matches(FORMS[oneForm]) && oneForm.indexOf('alt') < 0)

        let formCount = 0
        
        poses.map(pos => formCount += getForms(pos).length)

        return <div className='inflectionForm'>
            <h1>{ title }</h1>
            <div className='columns'>
                <div className='main'>
                    {
                        factoid ? 
                            <div className='factoid' 
                                dangerouslySetInnerHTML={ { __html: marked(factoid.explanation) } }/>
                        :
                            null 
                    }

                    { 
                        phrases && phrases.length ?
                        <div>
                            <h3>Expressions</h3>
                            {
                                isCase 
                                ?
                                <div>
                                    These are the prepositions and expressions that use the { form.name } case. 

                                    <FactPivotTable
                                        data={ phrases }
                                        dimensions={ [ 
                                            new PhrasePrepositionDimension(this.props.factLinkComponent)
                                        ] }
                                        getIdOfEntry={ (f) => f.getId() }
                                        renderEntry={ renderFactEntry(corpus, this.props.factLinkComponent) }
                                        itemsPerCategoryLimit={ 3 }
                                    />
                                </div>
                                :
                                <div>
                                    { !this.state.allPhrases ?
                                        <div>
                                            These are the most important expressions using the { form.name }:
                                            
                                            <div className='seeAll' onClick={ () => this.setState({ allPhrases : true })}>See all</div>
                                        </div>
                                        :                        
                                        <div>
                                            These are all expressions using the { form.name } (in order of commonness):
                                            
                                            <div className='seeAll' onClick={ () => this.setState({ allPhrases : false })}>See less</div>
                                        </div>
                                    }

                                    <ul className='phrases'>
                                    {
                                        (this.state.allPhrases ? phrases : phrases.slice(0, 10))
                                            .map(phrase => 
                                                renderRelatedFact(phrase, corpus, this.props.factLinkComponent) 
                                            )
                                    }
                                    </ul>
                                </div>
                            }
                        </div>
                        :
                        null
                    }

                    { formationExists ? 
                        <div>
                            <h3>Formation</h3>

                            { !this.state.allFormations ?
                                <div>
                                    These are the most important ways of forming the { form.name }.
                                    
                                    <div className='seeAll' onClick={ () => this.setState({ allFormations : true })}>See all</div>
                                </div>
                                :                        
                                <div>
                                    These are all ways of forming the { form.name }.
                                    
                                    <div className='seeAll' onClick={ () => this.setState({ allFormations : false })}>See less</div>
                                </div>
                            }
                            {
                                poses.map(pos => {
                                    let forms = getForms(pos)

                                    if (forms.length) {
                                        return this.renderFormation(pos, forms, filter, formCount)
                                    }
                                    else {
                                        return null
                                    }
                                })            
                            }
                        </div>
                        : 
                        null
                    }

                    { showExamples ?
                        <div>
                            <h3>Examples of usage</h3>

                            <div className='exampleSentences'>
                            {
                                sentences 
                            }
                            </div>
                        </div>
                        :
                        null
                    }

                    <h3>Other forms</h3> 

                    {   
                        poses.map(pos =>
                            <div key={ pos }>
                                <InflectionTableComponent
                                    title={ POS_LONG_NAMES[pos] }
                                    corpus={ corpus }
                                    mask={ () => true }
                                    pos={ pos }
                                    className='otherForms'
                                    renderForm={ renderFormName(pos, this.props.factLinkComponent) }
                                />
                            </div>
                        )
                    }

                </div>
                { related.length ?
                    <div className='sidebar'>
                        <div>
                            <h3>See also</h3>

                            <ul>
                            {
                                related.map(fact =>     
                                    renderRelatedFact(fact, corpus, this.props.factLinkComponent) 
                                ) 
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

    getPhrase(sentence: Sentence, form: InflectionForm) {
        let result: { text: string, phrase: Phrase, en: () => string }

        sentence.phrases.find(phrase => {
            if (form.grammaticalCase && !phrase.hasCase(form.grammaticalCase)) {
                return 
            }

            let m = phrase.match({ words: sentence.words, sentence: sentence, facts: this.props.corpus.facts })

            if (m && m.words.find(w => { let word = w.word; return word instanceof InflectedWord && form.matches(FORMS[word.form]) })) {
                result = {
                    text: m.words.map(w => w.word.toString()).join(' '),
                    phrase: phrase,
                    en: () => m.pattern.getEnglishFragments().map(frag => frag.en(m)).join(' '),
                }

                return true
            }
        })

        return result
    }


}
