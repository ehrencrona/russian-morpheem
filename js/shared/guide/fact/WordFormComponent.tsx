import { define } from 'mime';
import { NamedWordForm, WordForm } from '../../inflection/WordForm';
import { WORD_FORMS } from '../../inflection/WordForms';
import Fact from '../../../shared/fact/Fact';
import InflectableWord from '../../../shared/InflectableWord';
import InflectedWord from '../../../shared/InflectedWord';
import { PartOfSpeech as PoS } from '../../../shared/inflection/Dimensions';
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
import { downscoreRepeatedWord, highlightTranslation, tokensToHtml } from './exampleSentences';
import FactLinkComponent from './FactLinkComponent';
import getExamplesUsingInflection from './getExamplesUsingInflection';
import renderRelatedFact from './renderRelatedFact';
import marked = require('marked');
import { Component, createElement } from 'react';
import Corpus from '../../../shared/Corpus'

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
        if (!this.props.form.pos || !INFLECTION_FORMS[this.props.form.pos]) {
            return null
        }

        let defaultForm = INFLECTION_FORMS[this.props.form.pos].allForms[0]

        let inflections = this.mostCommonInflections(this.props.form, defaultForm)

        if (!inflections.length || 
            !inflections.find(i => 
                i.getEnding(defaultForm).suffix != inflections[0].getEnding(defaultForm).suffix)) {
            return null
        }

        return <div>
            <h3>Endings</h3>

            <div>Most common endings:</div>
 
            <ul className='formation'>
            {
                inflections.map(inflection => {
                    let ending = inflection.getEnding(defaultForm)

                    return <div key={ inflection.getId() }>
                        {
                            ending.suffix || 'None'
                        }: 
                        {
                            getExamplesUsingInflection(defaultForm, inflection, this.props.corpus, this.props.knowledge, null, 3)
                                .map(w => <span key={ w.getId() } className='word clickable'>{ 
                                    React.createElement(this.props.factLinkComponent, {
                                        fact: w
                                    }, w.toText())
                                }</span>)
                        }
                    </div>

                })
            }
            </ul>
        </div>
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

    render() {
        let corpus = this.props.corpus
        let form = this.props.form

        let factoid = corpus.factoids.getFactoid(form)

        let forms: InflectionForm[] = []

        let related = this.getRelatedForms()
            .concat(
                (factoid ? 
                    factoid.relations.map(f => corpus.facts.get(f.fact)).filter(f => !!f) : []))

        let sentences = this.getSentences(form)

        let title = corpus.factoids.getFactoid(form).name || form.name

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
                        this.renderFormation()
                    }

                    <h3>Common Words</h3>

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
                        this.getWords().map(word => renderRelatedFact(word, this.props.corpus, this.props.factLinkComponent))
                    }</ul>

                    <h3>Examples of usage</h3>

                    <ul className='sentences'>
                        {
                            (sentences || []).map(sentence => 
                                <li key={ sentence.sentence.id }>
                                    {
                                        React.createElement(this.props.factLinkComponent, { fact: sentence.sentence }, 
                                            <div dangerouslySetInnerHTML={ { __html: 
                                                tokensToHtml(sentence.tokens)
                                            }}/>)
                                    }
                                    <div className='en' dangerouslySetInnerHTML={ { __html: 
                                        highlightTranslation(sentence) } }/>
                                </li>
                            )
                        }
                    </ul>
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

    getSentences(form: NamedWordForm) {
        let corpus = this.props.corpus

        let sentences = this.props.corpus.sentences.sentences.filter(sentence => {
            return !!sentence.words.find(w => w.wordForm.matches(form))
        })
        
        let scores

        if (sentences.length) {
            scores = sentences.map(sentence => 
                { 
                    return {
                        sentence: sentence,
                        fact: form,
                        score: 1
                    }    
                })

            scores = new KnowledgeSentenceSelector(this.props.knowledge).scoreSentences(scores)

            scores = downscoreRepeatedWord(scores, 
                (word) => word instanceof InflectedWord && form.matches(FORMS[word.form]))

            scores = topScores(scores, 6)
        }
        else {
            scores = []
        }

        let ignorePhrases = true

        return scores.map(s => {
            return {
                sentence: s.sentence,
                tokens: this.highlightExamples(toStudyWords(s.sentence, [ form ], this.props.corpus, ignorePhrases))
            }
        })
    }

    highlightExamples(tokens: any[]) {
        tokens.forEach(token => {
            if (token instanceof StudyWord && token.word.wordForm.matches(this.props.form)) {
                token.studied = true
            } 
        })

        return tokens
    }
}
