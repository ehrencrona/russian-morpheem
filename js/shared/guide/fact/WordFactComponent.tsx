import { getGuideFact } from '../allGuideFacts';
import { Match } from '../../phrase/Match';
import { getFileName } from '../../../backend/route/getAudio';


import { Component, createElement } from 'react'

import Corpus from '../../../shared/Corpus'

import InflectedWord from '../../../shared/InflectedWord'
import InflectableWord from '../../../shared/InflectableWord'
import AbstractAnyWord from '../../../shared/AbstractAnyWord'
import Fact from '../../../shared/fact/Fact'
import { Knowledge } from '../../../shared/study/Exposure'

import Ending from '../../../shared/Ending'
import Sentence from '../../../shared/Sentence'

import Inflection from '../../../shared/inflection/Inflection'
import { getFormName, INFLECTION_FORMS } from '../../../shared/inflection/InflectionForms';
import { PartOfSpeech as PoS } from '../../../shared/inflection/Dimensions' 
import InflectionFact from '../../../shared/inflection/InflectionFact'
import {
    Derivation,
    getDerivations,
    getNamedForm,
    getNonRedundantNamedForms
} from '../../../shared/inflection/WordForms';

import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'
import SentenceScore from '../../../shared/study/SentenceScore'
import KnowledgeSentenceSelector from '../../../shared/study/KnowledgeSentenceSelector'
import topScores from '../../../shared/study/topScores'
import Phrase from '../../../shared/phrase/Phrase'
import findPhrasesWithWord from '../../../shared/phrase/findPhrasesWithWord'

import Transform from '../../../shared/Transform'
import { EndingTransform } from '../../../shared/Transforms'

import { Factoid } from '../../../shared/metadata/Factoids'
import htmlEscape from '../../../shared/util/htmlEscape'
import Words from '../../../shared/Words'
import Word from '../../../shared/Word'
import AnyWord from '../../../shared/AnyWord'

import InflectionTableComponent from '../../../shared/guide/InflectionTableComponent'
import { renderWordInflection } from '../../../shared/guide/InflectionTableComponent'
import StudyToken from '../../study/StudyToken'
import StudyWord from '../../study/StudyWord'
import StudyPhrase from '../../study/StudyPhrase'
import toStudyWords from '../../study/toStudyWords'

import StudyFact from '../../study/StudyFact'

import { TokenizedSentence, downscoreRepeatedWord, tokensToHtml, highlightTranslation } from './exampleSentences'

import FactLinkComponent from './FactLinkComponent'
import renderRelatedFact from './renderRelatedFact'
import renderTagFacts from './renderTagFacts'

import marked = require('marked');

import { FactPivotTable, renderFactEntry } from '../pivot/PivotTableComponent'
import PhrasePrepositionDimension from '../pivot/PhrasePrepositionDimension'
import PhraseCaseDimension from '../pivot/PhraseCaseDimension'

import GroupedListComponent from '../pivot/GroupedListComponent'
import { MatchPhraseDimension, MatchTextDimension } from '../pivot/MatchTextDimension'

import { getMatchesForWord, renderMatch } from './exampleSentences'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    word: AbstractAnyWord,
    knowledge: NaiveKnowledge,
    factLinkComponent: FactLinkComponent
}

interface State {
    sentences?: TokenizedSentence[]
}

const MAX_EXAMPLES_OF_INFLECTION = 5

export default class WordFactComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = { }
    }

    wordChanged(fact: Fact) {
        let corpus = this.props.corpus
        let word = this.props.word

        let sentences = corpus.sentences.getSentencesByFact(corpus.facts)[ fact.getId() ]

        let scores
        
        if (sentences) {
            scores = sentences.easy.concat(sentences.ok).concat(sentences.hard).map(ss => 
                { 
                    return {
                        sentence: ss.sentence,
                        fact: fact,
                        score: 1
                    }    
                })

            scores = new KnowledgeSentenceSelector(this.props.knowledge).scoreSentences(scores)

            scores = downscoreRepeatedWord(scores, w => w instanceof InflectedWord && w.word == word)

            scores = topScores(scores, 12)
        }
        else {
            scores = []
        }

        let ignorePhrases = true

        this.setState({
            sentences: scores.map(s => {
                return {
                    sentence: s.sentence,
                    tokens: toStudyWords(s.sentence, [ fact ], this.props.corpus, ignorePhrases)
                }
            })
        })
    }

    componentWillReceiveProps(props) {
        if (props.word != this.props.word) {
            this.wordChanged(props.word.getWordFact())
        }
    }

    componentWillMount() {
        let fact = this.props.word.getWordFact()

        this.wordChanged(fact)
    } 

    wordsWithSimilarInflection() {
        let word = this.props.word

        if (word instanceof InflectableWord) {
            let inflection = word.inflection

            let wordsWithInflection = (inflection: Inflection, word: InflectableWord) =>
                this.props.corpus.facts.facts.filter(f =>
                    f instanceof InflectableWord && 
                    f.inflection == inflection &&
                    f.getIdWithoutClassifier() != word.getIdWithoutClassifier() &&
                    f.getDefaultInflection() != word.getDefaultInflection()
                )

            let result = wordsWithInflection(inflection, word)

            if (!result.length) {
                // try the parent
                inflection = word.inflection.inherits.find(i => i.getId().substr(0, 6) != 'abstr-')

                result = wordsWithInflection(inflection, word)
            }

            if (!result.length) {
                // find others inheriting the parent (the parent might have no direct users)
                result = this.props.corpus.facts.facts.filter(f =>
                    f instanceof InflectableWord && 
                    f.inflection.inherits.indexOf(inflection) >= 0 &&
                    f.getIdWithoutClassifier() != word.getIdWithoutClassifier() &&
                    f.getDefaultInflection() != (word as InflectableWord).getDefaultInflection()
                )
            }

            return sortByKnowledge(result, this.props.knowledge).slice(0, 5)
        }
    }

    getSentences() {
        let corpus = this.props.corpus
        let word = this.props.word

        let matches = getMatchesForWord(word, this.props.knowledge, corpus)

        class MatchListComponent extends GroupedListComponent<Match> {
        }

        let dimensions = [ 
            new MatchPhraseDimension(),
            new MatchTextDimension(true) 
        ]

        return <MatchListComponent
            data={ matches }
            getIdOfEntry={ (match) => match.sentence.id }
            dimensions={ dimensions }
            renderEntry={ renderMatch(word.getWordFact(), corpus, this.props.factLinkComponent) }
            renderGroup={ (entry, children, key) => <div key={ key }>
                { entry }
                <ul className='sentences'>{ children }</ul>
            </div> }
            itemsPerGroupLimit={ 3 }
            itemsLimit={ 30 }
            groupLimit={ 10 }
        />   
    }

    renderDerivations() {
        let word = this.props.word

        const DERIVATION_NAMES = {
            perf: 'perfective',
            imperf: 'imperfective',
            refl: 'reflexive',
            nonrefl: 'non-reflexive',
            adj: 'adjective',
            adv: 'adverb'
        }

        let renderDerivedWord = (derived: AnyWord, derivation: Derivation) => {
            let name = derived.getEnglish() 

            if (name == word.getEnglish()) {
                name = DERIVATION_NAMES[derivation.id] || derivation.id 
            }
            else if (DERIVATION_NAMES[derivation.id]) {
                name += ` – ${DERIVATION_NAMES[derivation.id]}` 
            }

            let content = <div className='derivation' key={ derived.getId() }>
                <div className='inner'>
                    <div>{
                        name
                    }</div>
                    <div className='word'>{ derived.toText() }</div>
                </div>
            </div>

            return React.createElement(this.props.factLinkComponent, {
                fact: derived.getWordFact(),
                key: derived.getId()
            }, content)
        }

        return getDerivations(word.wordForm).map(derivation =>
            word.getDerivedWords(derivation.id)
                .map(derived => renderDerivedWord(derived, derivation)))
            .reduce((a, b) => a.concat(b), [])
    }

    renderInflectionTable() {
        let props = this.props
        let word = props.word
        let corpus = props.corpus

        let renderForm: (form: string) => any

        interface FormsOfInflection {
            inflection: Inflection
            forms: string[]
            index: number
            depth: number
        }

        let inflections: FormsOfInflection[] = []
        let inflectionsById: { [ id: string ] : FormsOfInflection } = {}

        if (word instanceof InflectableWord) {
            let inflection = word.inflection

            inflection.getAllForms().forEach(form => {
                let formInflection = inflection.getFact(form).inflection

                let foi: FormsOfInflection = inflectionsById[formInflection.id]
                
                if (!foi) {
                    foi = {
                        inflection: formInflection,
                        forms: [],
                        index: inflections.length,
                        depth: formInflection.getDepth()
                    }

                    inflectionsById[formInflection.id] = foi
                    inflections.push(foi)
                }
                
                foi.forms.push(form)
            })

            inflections.sort((i1, i2) => i2.depth - i1.depth)
            inflections.forEach((foi, index) => foi.index = index)

            renderForm = renderWordInflection(word, corpus, 
                    (inflectedWord, form, factIndex) => {
                let inflectionIndex = inflectionsById[(word as InflectableWord)
                    .inflection.getFact(form).inflection.id].index

                let inflectableWord = word as InflectableWord 

                return <div className={ 'clickable pad inflection' + inflectionIndex } key={ form }>{
                    React.createElement(props.factLinkComponent, 
                        { 
                            fact: inflectableWord.inflection.getFact(form),
                            key: inflectableWord.inflection.id,
                            context: inflectableWord.inflect(form) 
                        }, 
                        inflectableWord.inflect(form).toString())
                    }
                </div>
            })

            let pos = word.wordForm.pos

            // primarily for мой
            if (!INFLECTION_FORMS[pos]) {
                pos = word.inflection.wordForm.pos
            }

            return <div className='inflectionTable'>
                    <InflectionTableComponent
                        corpus={ corpus }
                        pos={ pos }
                        mask={ word.mask }
                        factLinkComponent={ props.factLinkComponent }
                        renderForm={ renderForm }
                        title={ word.wordForm.pos == PoS.VERB ? 'Conjugation' : 
                            (word.wordForm.pos == PoS.NOUN ? 'Declension' : 'Forms') }
                        />

                    <div className='legendIntro'>
                        These words share endings with { word.toText() }, starting from the stem <b>{ word.stem }-</b>: 
                    </div>

                    <ul className='legend'>{
                        inflections.map((foi, index) => {
                            let words = this.getWordsUsingInflection(
                                    foi.inflection, foi.forms, word as InflectableWord)

                            let ellipsis

                            if (words.length > MAX_EXAMPLES_OF_INFLECTION) {
                                words = words.slice(0, MAX_EXAMPLES_OF_INFLECTION)
                                ellipsis = true
                            }
                            
                            let wordElements = words.map(word => 
                                React.createElement(
                                    this.props.factLinkComponent, 
                                    {
                                        key: word.getId(),
                                        fact: word
                                    },
                                    <span className='wordStem'>
                                        <span className='word'>{ word.toText() }</span> 
                                        {
                                            word.inflection.getEnding(word.getDefaultInflection().form).subtractFromStem 
                                            ? <span> ({ word.stem }-)</span>
                                            : null
                                        }
                                    </span>
                                    ))

                            return <li key={ foi.inflection.id }>
                                <div className={ 'swatch inflection' + index }/>
                                { wordElements.length ?
                                    <span>{ foi.inflection.description ? foi.inflection.description + ': ' : '' }{
                                        joinWithComma(wordElements)
                                    }{ ellipsis ? ' ...' : null }</span>
                                    :
                                    <span>unique to { word.toText() }</span>
                                }
                            </li>})
                    }</ul>
                </div>
        }
        else {
            return null
        }
    }

    getWordsUsingInflection(inflection: Inflection, forms: string[], otherThan: InflectableWord) {
        let result: InflectableWord[] = []
        let seen = new Set<string>()

        this.props.corpus.facts.facts.find(fact => {
            if (fact instanceof InflectableWord 
                && fact.stem != otherThan.stem
                && !seen.has(fact.toText()) 
                && !forms.find(form => {
                    let inflectionFact = fact.inflection.getFact(form)
                    
                    return !inflectionFact || inflectionFact.inflection.id != inflection.id
                })) {
                result.push(fact)
                seen.add(fact.toText())

                return result.length > MAX_EXAMPLES_OF_INFLECTION
            }
        })

        return result
    }

    render() {
        let props = this.props
        let word = props.word
        let corpus = props.corpus
        let thisIdWithoutClassifier = word.getIdWithoutClassifier() 

        let factoid = corpus.factoids.getFactoid(props.word.getWordFact())

        let otherMeanings = corpus.facts.facts.filter(fact => 
            { 
                if (fact instanceof InflectableWord || fact instanceof Word) {
                    return fact.getIdWithoutClassifier() == thisIdWithoutClassifier &&
                        fact.getId() != word.getId()
                }
            })

        let related =
            (word.required || [])
            .concat(factoid ?
                factoid.relations.map(f => getGuideFact(f.fact, corpus)).filter(f => !!f)
                :
                [])

        let posSpecific = null

        let phrasesWithWord = findPhrasesWithWord(word, corpus)
        
        if (word.wordForm.pos == PoS.PREPOSITION) {
            posSpecific = <div>
                <h3>Phrases</h3>

                { props.word.toText() } is used in the following phrases with the following cases:

                <FactPivotTable
                    data={ phrasesWithWord }
                    getIdOfEntry={ (f) => f.getId() }
                    renderEntry={ renderFactEntry(corpus, props.factLinkComponent) }
                    dimensions={ [ 
                        new PhraseCaseDimension(props.factLinkComponent), 
                    ] }
                />
            </div>
        }
        else {
            related = related.concat(
                sortByKnowledge(phrasesWithWord, props.knowledge))
        }

        return <div className='fact wordFact'>
            <h1>{ word.toText() }</h1>
            <h2>{ word.getEnglish((word.wordForm.pos == PoS.VERB ? 'inf' : '')) }</h2>

            { renderTagFacts(word.getWordFact(), corpus, 
                props.factLinkComponent, getNonRedundantNamedForms(word.wordForm)) }

            { this.renderDerivations() }

            {
                factoid ? 
                    <div className='factoid' 
                        dangerouslySetInnerHTML={ { __html: marked(factoid.explanation) } }/>
                :
                    null 
            }

            <div>
                { 
                    otherMeanings.length ?
                    <div className='otherMeanings'>
                        It can also mean {
                            otherMeanings.map((fact, index) =>
                                <span key={ fact.getId() }>{ index > 0 ? ' or ' : ''}<span 
                                    className='clickable'>{
                                        React.createElement(props.factLinkComponent, 
                                            { fact: fact, key: fact.getId() }, 
                                            (fact as Word).getEnglish())
                                    }</span>
                                </span>)
                        }
                    </div>
                    :
                    null
                }

            </div>

            <div className='columns'>
                <div className='main'>
                    { 
                        posSpecific
                    }
                    <h3>Examples of usage</h3>

                    <div className='exampleSentences'>{
                        this.getSentences()
                    }
                    </div>
                </div>
                <div className='sidebar'>
                    <div>
                        <h3>See also</h3>

                        <ul>
                        {
                            related.map(fact => 
                                renderRelatedFact(fact, corpus, props.factLinkComponent) 
                            ) 
                        }
                        </ul>
                    </div>
                </div>
            </div>

            { word instanceof InflectableWord ?
                <div className='columns'>
                    <div className='main'>
                        { this.renderInflectionTable() }
                    </div>
                    <div className='sidebar'>
                        <div>
                            <h3>Words with<br/>similar endings</h3>

                            <ul>
                            {
                                this.wordsWithSimilarInflection().map(fact => 
                                    renderRelatedFact(fact, corpus, props.factLinkComponent) 
                                ) 
                            }
                            </ul>
                        </div>
                    </div>
                </div>
                :
                null
            }
        </div>
    }
}

export function sortByKnowledge(facts: Fact[], knowledge: NaiveKnowledge) {
    let known: Fact[] = []
    let unknown: Fact[] = []

    facts.forEach(fact => {
        if (knowledge.getKnowledge(fact) == Knowledge.KNEW) {
            known.push(fact)
        }
        else {
            unknown.push(fact)
        }
    })

    return known.concat(unknown)
}


function joinWithComma(array: any[]) {
    let result = []

    array.forEach((item, index) => {
        if (index > 0) {
            result.push(<span key={ index }>, </span>)
        }

        result.push(item)
    })

    return result
}