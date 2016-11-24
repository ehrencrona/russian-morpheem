import { Match } from '../../phrase/Match';
import AnyWord from '../../AnyWord';
import { PivotDimension } from '../pivot/PivotDimension';
import { define } from 'mime';
import { NamedWordForm, WordForm } from '../../inflection/WordForm';
import { WORD_FORMS } from '../../inflection/WordForms';
import Fact from '../../../shared/fact/Fact';
import InflectableWord from '../../../shared/InflectableWord';
import InflectedWord from '../../../shared/InflectedWord';
import { PartOfSpeech as PoS, PronounKind } from '../../../shared/inflection/Dimensions';
import { InflectionForm } from '../../../shared/inflection/InflectionForm';
import Inflection from '../../../shared/inflection/Inflection'
import { FORMS, INFLECTION_FORMS, POSES } from '../../../shared/inflection/InflectionForms';
import Phrase from '../../../shared/phrase/Phrase';
import PhraseMatch from '../../../shared/phrase/PhraseMatch';
import WordInFormMatch from '../../../shared/phrase/WordInFormMatch';
import KnowledgeSentenceSelector from '../../../shared/study/KnowledgeSentenceSelector';
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge';
import SentenceScore from '../../../shared/study/SentenceScore';
import topScores from '../../../shared/study/topScores';
import Transform from '../../../shared/Transform';
import AbstractAnyWord from '../../../shared/AbstractAnyWord'
import StudyFact from '../../study/StudyFact';
import StudyWord from '../../study/StudyWord'
import toStudyWords from '../../study/toStudyWords';
import capitalize from './capitalize';
import FactLinkComponent from './FactLinkComponent';
import getExamplesUsingInflection from './getExamplesUsingInflection';
import renderRelatedFact from './renderRelatedFact';
import marked = require('marked');
import { Component, createElement } from 'react';
import Corpus from '../../../shared/Corpus'
import GroupedListComponent from '../pivot/GroupedListComponent'
import { MatchPhraseDimension, MatchTextDimension } from '../pivot/MatchTextDimension'
import MatchEndingDimension from '../pivot/MatchEndingDimension'
import { FactPivotTable, renderFactEntry as renderPivotFactEntry } from '../pivot/PivotTableComponent'
import PhrasePrepositionDimension from '../pivot/PhrasePrepositionDimension'
import PhraseCaseDimension from '../pivot/PhraseCaseDimension'
import WordDefaultEndingDimension from '../pivot/WordDefaultEndingDimension'
import NounGenderDimension from '../pivot/NounGenderDimension'
import MatchDefaultFormDimension from '../pivot/MatchDefaultFormDimension'
import { renderFormName, InflectionTableComponent } from '../InflectionTableComponent'
import { TokenizedSentence, downscoreRepeatedWord, tokensToHtml, getMatchesForWordForm, getFilterPhrasesForWordForm,
    highlightTranslation, getMatchesForInflectionForm, renderMatch } from './exampleSentences'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    form: NamedWordForm,
    knowledge: NaiveKnowledge,
    factLinkComponent: FactLinkComponent
}

interface State {
    allWords?: boolean,
    allFormations?: boolean
}

/** Gives general information about a form that matches several forms, typically a case */
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

    mostCommonInflections(wordForm: WordForm, defaultInflectionForm: string): Inflection[] {
        let wordsByInflection = {}
        let corpus = this.props.corpus

        corpus.facts.facts.forEach(fact => {
            if (fact instanceof InflectableWord && fact.wordForm.matches(wordForm)) {
                let defaultFormFact = fact.inflection.getFact(defaultInflectionForm)

                if (!defaultFormFact) {
                    return
                }

                let inheritedId = defaultFormFact.inflection.id

                wordsByInflection[inheritedId] = (wordsByInflection[inheritedId] || 0) + 1
            }
        })

        let inflectionIds = Object.keys(wordsByInflection).sort(
            (form1, form2) => wordsByInflection[form2] - wordsByInflection[form1])

        inflectionIds = inflectionIds.slice(0, (this.state.allFormations ? 99 : 5))

        return inflectionIds
            .map(inflectionId => corpus.inflections.getInflection(inflectionId))
            .filter(f => !!f)
    }

    renderFormation() {
        let props = this.props
        let defaultForm = INFLECTION_FORMS[props.form.pos].allForms[0]

        let inflections = this.mostCommonInflections(props.form, defaultForm)

        if (!inflections.length || 
            !inflections.find(i => 
                i.getEnding(defaultForm).suffix != inflections[0].getEnding(defaultForm).suffix)) {
            return null
        }

        let dimensions: PivotDimension<Fact, any>[] = 
            [ new WordDefaultEndingDimension(props.factLinkComponent, 1) ]

        let facts =
            props.corpus.facts.facts.filter(fact =>
                fact instanceof InflectableWord && fact.wordForm.matches(props.form))

        let filterLimit

        if (props.form.pos == PoS.ADJECTIVE) {
            // exclude those that are only comparative
            facts = facts.filter(w => w instanceof InflectableWord && 
                (!!w.inflect('m') || !!w.inflect('shortm')))
        }
        else if (props.form.pos == PoS.NOUN) {
            // exclude those that don't have singular
            facts = facts.filter(w => w instanceof InflectableWord && !!w.inflect('nom'))

            if (!props.form.gender) {
                dimensions = [ new NounGenderDimension() as PivotDimension<Fact, any> ].concat(dimensions)
            }
        }

        filterLimit = Math.round(facts.length / 50)

        return <div>
            <h3>Endings</h3>

            <div>Most common endings:</div>
 
            <FactPivotTable
                data={ facts }
                dimensions={ dimensions }
                getIdOfEntry={ (f) => f.getId() }
                renderEntry={ renderPivotFactEntry(props.corpus, props.factLinkComponent) }
                hideCategoryLimit={ 1 }
                itemsPerCategoryLimit={ 3 } 
            />
        </div>
    }

    renderPrepositionPhrases() {
        let props = this.props

        if (props.form.pos == PoS.PREPOSITION) {
            return <FactPivotTable
                data={ props.corpus.phrases.all() }
                getIdOfEntry={ (f) => f.getId() }
                renderEntry={ renderPivotFactEntry(props.corpus, props.factLinkComponent) }
                itemsPerCategoryLimit={ 1 }
                dimensions={ [
                    new PhraseCaseDimension(props.factLinkComponent), 
                    new PhrasePrepositionDimension(props.factLinkComponent), 
                ] }
            />
        }

        return null
    }

    getRelatedForms() {
        let thisForm = this.props.form

        return Object.keys(WORD_FORMS).map(i => WORD_FORMS[i])
            .filter(form => (thisForm.matches(form) || form.matches(thisForm)) && thisForm.id != form.id)
            .map(f => f as Fact)
    }

    getWords() {
        let result = this.props.corpus.facts.facts.filter(f => 
            f instanceof AbstractAnyWord && f.wordForm.matches(this.props.form))

        if (!this.state.allWords) {
            result = result.slice(0, 12)
        }

        return result
    }

    renderPronouns() {
        let link = (id) => {
            let word = this.props.corpus.facts.get(id)

            if (word instanceof AbstractAnyWord) {
                return <div key={ word.getId() }>{ 
                    React.createElement(this.props.factLinkComponent, {
                        fact: word.getWordFact(),
                        key: word.getId()
                    }, word.toText()) } – { word.getEnglish() }</div>
            }
            else {
                return null
            }
        }

        return <table className='pronouns'>
            <thead>
            </thead>

            <tbody>
                <tr>
                    <td>
                        { link('я') }
                    </td>
                    <td>
                        { link('мы') }
                    </td>
                </tr>
                <tr>
                    <td>
                        { link('ты') }
                    </td>
                    <td>
                        { link('вы') }
                    </td>
                </tr>
                <tr>
                    <td>
                        { link('он') }
                        { link('она') }
                        { link('оно') }
                    </td>
                    <td>
                        { link('они') }
                    </td>
                </tr>

            </tbody>
        </table>

    }

    renderWordExamples() {
        let props = this.props
        let form = props.form

        if (form.pos == PoS.PREPOSITION) {
            return this.renderPrepositionPhrases()
        }
        else if (form.pronounKind == PronounKind.PERSONAL) {
            return <div>
                <h3>Table</h3>
                { this.renderPronouns() }
            </div>
        }
        else if (form.pos == PoS.PRONOUN && !form.pronounKind) {
            const NAMES = {}
            NAMES[PronounKind.PERSONAL] = 'personal'
            NAMES[PronounKind.QUESTION] = 'question'

            let dimension: PivotDimension<Fact, string> = {
                getKey: (value: string) => {
                    return value
                },

                getValues: (fact: Fact): string[] => {
                    if (fact instanceof AbstractAnyWord) {
                        if (fact.wordForm.negation) {
                            return [ 'negative' ]
                        }

                        return [ NAMES[fact.wordForm.pronounKind] || 'other' ]
                    }
                },

                renderValue: (value: string) => {
                    return value
                },

                name: 'Kind'
            }

            return <div>
                <h3>Common Words</h3>

                <FactPivotTable
                    data={ this.getWords() }
                    renderEntry={ renderPivotFactEntry(props.corpus, props.factLinkComponent) }
                    getIdOfEntry={ (f)=> f.getId()}
                    dimensions={ [
                        dimension
                    ]}
                />
            </div>
        }
        else {
            return <div>
                { !this.state.allWords ?
                    <div>
                        Examples of some important { form.name.toLowerCase() }:
                        
                        <div className='seeAll' onClick={ () => this.setState({ allWords : true })}>See all</div>
                    </div>
                    : 
                    <div>
                        These are all { form.name.toLowerCase() } up to a lower intermediate level.
                        
                        <div className='seeAll' onClick={ () => this.setState({ allWords : false })}>See all</div>
                    </div>
                }
                <ul>{
                    this.getWords().map(word => renderRelatedFact(word, props.corpus, props.factLinkComponent))
                }</ul>
            </div>  
        }
    }


    render() {
        let corpus = this.props.corpus
        let form = this.props.form

        let factoid = corpus.factoids.getFactoid(form)

        let forms: InflectionForm[] = []

        let related = this.getRelatedForms()
            .concat(
                (factoid ? 
                    factoid.relations.map(f => corpus.facts.get(f.fact)).filter(f => !!f) : []))

        let sentences = this.getSentences()

        let title = corpus.factoids.getFactoid(form).name || form.name

        let showFormation = form.pos && INFLECTION_FORMS[form.pos] && 
            form.pos != PoS.PRONOUN  && form.pos != PoS.PREPOSITION

        let showUsage = form != WORD_FORMS['n'] && form != WORD_FORMS['v'] && form != WORD_FORMS['adj'] 

        let showForms = form.equals({ pos: form.pos }) && INFLECTION_FORMS[form.pos]

        return <div className='wordForm'>
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
                        showFormation 
                        ? this.renderFormation()
                        : this.renderWordExamples()
                    }

                    { showUsage ?
                        <div>
                            <h3>Examples of Usage</h3>
                            <div className='exampleSentences'>
                            {
                                sentences 
                            }
                            </div>
                        </div>
                        :
                        null
                    }

                    {
                        showForms ?
                            <div>
                                <h3>Forms</h3>

                                <InflectionTableComponent
                                    corpus={ this.props.corpus }
                                    pos={ form.pos  }
                                    mask={ () => false }
                                    factLinkComponent={ this.props.factLinkComponent }
                                    className='otherForms'
                                    renderForm={ renderFormName(form.pos, this.props.factLinkComponent) }
                                />
                            </div>
                            :
                            null
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

    getSentences() {
        let corpus = this.props.corpus
        let form = this.props.form

        let filterPhrases = null ; // getFilterPhrasesForWordForm(form)
        let matches = getMatchesForWordForm(filterPhrases, form, this.props.knowledge, corpus)

        class MatchListComponent extends GroupedListComponent<Match> {
        }

        let dimensions: PivotDimension<Match, any>[] = [
            new MatchTextDimension(true)
        ]

        let renderEntry = (entry, children, key) => key

        if (filterPhrases) {
            dimensions = [ new MatchPhraseDimension() ].concat(dimensions)
        }
        else if (INFLECTION_FORMS[ form.pos ]) {
            dimensions = [ new MatchDefaultFormDimension() as PivotDimension<Match, any> ].concat(dimensions)
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
}
