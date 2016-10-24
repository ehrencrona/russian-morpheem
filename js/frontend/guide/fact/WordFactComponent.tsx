

import { Component, createElement } from 'react'

import Corpus from '../../../shared/Corpus'

import InflectedWord from '../../../shared/InflectedWord'
import InflectableWord from '../../../shared/InflectableWord'
import AbstractAnyWord from '../../../shared/AbstractAnyWord'
import Fact from '../../../shared/fact/Fact'
import { Knowledge } from '../../../shared/study/Exposure'

import Inflection from '../../../shared/inflection/Inflection'
import Ending from '../../../shared/Ending'
import Sentence from '../../../shared/Sentence'

import { getFormName } from '../../../shared/inflection/InflectionForms' 
import InflectionFact from '../../../shared/inflection/InflectionFact'
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

import StudyToken from '../../study/StudyToken'
import StudyWord from '../../study/StudyWord'
import StudyPhrase from '../../study/StudyPhrase'
import toStudyWords from '../../study/toStudyWords'

import StudyFact from '../../study/StudyFact'

import renderRelatedFact from './renderRelatedFact'

let React = { createElement: createElement }

interface Props {
    corpus: Corpus,
    word: AbstractAnyWord,
    knowledge: NaiveKnowledge,
    onSelectFact: (fact: Fact, context?: AnyWord) => any
}

interface TokenizedSentence {
    sentence: Sentence,
    tokens: StudyToken[]
}

interface State {
    factoid?: Factoid
    sentences?: TokenizedSentence[]
}

export default class WordFactComponent extends Component<Props, State> {
    constructor(props) {
        super(props)

        this.state = { }
    }

    wordChanged(fact: Fact) {
        let corpus = this.props.corpus

        corpus.factoids.getFactoid(fact)
            .then(factoid => this.setState({ factoid: factoid } ))

        let sentences = corpus.sentences.getSentencesByFact(corpus.facts)[ fact.getId() ]

        let scores = sentences.easy.concat(sentences.ok).concat(sentences.hard).map(ss => 
            { 
                return {
                    sentence: ss.sentence,
                    fact: fact,
                    score: 1
                }    
            })

        scores = new KnowledgeSentenceSelector(this.props.knowledge).scoreSentences(scores)

        scores = this.downscoreRepeatedForms(scores)

        scores = topScores(scores, 6)

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

    downscoreRepeatedForms(scores: SentenceScore[]) {
        let word = this.props.word

        if (word instanceof InflectableWord) {
            let foundCountByForm = {}

            return scores.map(score => {

                let wordInSentence = score.sentence.words.find(w => w instanceof InflectedWord && w.word == word)

                if (wordInSentence) {
                    let form = wordInSentence.toText()

                    if (!foundCountByForm[form]) {
                        foundCountByForm[form] = 1
                    }
                    else {
                        foundCountByForm[form]++
                    }

                    if (foundCountByForm[form] > 2) {
                        score.score = score.score / 2
                    }
                }

                return score 

            })
        }
    }

    tokensToHtml(tokens: StudyToken[]) {
        function isWordWithSpaceBefore(word: StudyToken) {
            if (word instanceof StudyWord ) {
                return !(word.jp.length == 1 && Words.PUNCTUATION_NOT_PRECEDED_BY_SPACE.indexOf(word.jp) >= 0)
            }
            else {
                return true
            }
        }

        return tokens.map(t => {
            let html = htmlEscape(t.jp)

            if (t.studied) {
                html = '<span class="match">' + html + '</span>'
            }

            if (isWordWithSpaceBefore(t)) {
                html = ' ' + html
            }

            return html
        }).join('')
    }

    highlightTranslation(sentence: TokenizedSentence) {
        let result = htmlEscape(sentence.sentence.en())

        sentence.tokens.forEach(t => {

            if (t instanceof StudyWord && t.studied) {
                let word = t.word

                for (let i = 0; i < word.getTranslationCount(); i++) {
                    let separator = '([\\\s' + Words.PUNCTUATION + ']|^|$)'
                    let translation = word.getEnglish('', i)

                    let regex = new RegExp(separator + '(' + translation + ')' + separator, 'i')

                    let m = regex.exec(result)

                    if (m) {
                        result = result.substr(0, m.index) 
                            + m[1] 
                            + ' <span class="match">' + translation + '</span>'
                            + m[3] 
                            + result.substr(m.index + m[0].length)
                    }
                }
            }

        })

        return result
    }

    sortByKnowledge(facts: Fact[]) {

        let known: Fact[] = []
        let unknown: Fact[] = []

        facts.forEach(fact => {
            if (this.props.knowledge.getKnowledge(fact) == Knowledge.KNEW) {
                known.push(fact)
            }
            else {
                unknown.push(fact)
            }
        })

        return known.concat(unknown)
    }

    wordsWithSimilarInflection() {
        let word = this.props.word

        if (word instanceof InflectableWord) {
            let inflection = word.inflection

            let wordsWithInflection = (inflection: Inflection, word: InflectableWord) =>
                this.props.corpus.facts.facts.filter(f =>
                    f instanceof InflectableWord && 
                    f.inflection == inflection &&
                    f.getId() != word.getId() &&
                    f.getDefaultInflection() != word.getDefaultInflection()
                )

            let result = wordsWithInflection(inflection, word)

            if (!result.length) {
                inflection = word.inflection.inherits.find(i => i.getId().substr(0, 6) != 'abstr-')

                result = wordsWithInflection(inflection, word)
            }

            return this.sortByKnowledge(result).slice(0, 5)
        }
    }

    render() {
        let word = this.props.word
        let corpus = this.props.corpus
        let thisIdWithoutClassifier = word.getIdWithoutClassifier() 

        let otherMeanings = corpus.facts.facts.filter(fact => 
            { 
                if (fact instanceof InflectableWord || fact instanceof Word) {
                    return fact.getIdWithoutClassifier() == thisIdWithoutClassifier &&
                        fact.getId() != word.getId()
                }
            })

        let related = (this.state.factoid ? 
                this.state.factoid.relations.map(f => corpus.facts.get(f.fact)).filter(f => !!f) 
                : 
                [])
            .concat(this.sortByKnowledge(findPhrasesWithWord(word, corpus)))

        return <div className='fact'>
            <h1>{ word.toText() }</h1>
            <h2>{ word.getEnglish() }</h2>

            { 
                this.state.factoid ?

                <div>
                    <i> 
                        { this.state.factoid.explanation }
                    </i>

                    { 
                        otherMeanings.length ?
                        <div>
                            Other meanings: {
                                otherMeanings.map((fact, index) =>
                                    <span key={ fact.getId() }>{ index > 0 ? ', ' : ''}<span 
                                            className='clickable' onClick={ (e) => {
                                                this.props.onSelectFact(fact)
                                                e.stopPropagation()
                                            }
                                        } >{ (fact as Word).getEnglish()}
                                        </span>
                                    </span>)
                            }
                        </div>
                        :
                        null
                    }

                </div>

                :

                null
            }

            <div className='columns'>
                <div className='main'>
                    <h3>Examples of use</h3>

                    <ul>
                        {
                            (this.state.sentences || []).map(sentence => 
                                <li key={ sentence.sentence.id }>
                                    <div dangerouslySetInnerHTML={ { __html: 
                                        this.tokensToHtml(sentence.tokens)
                                    }}/>

                                    <div className='en' dangerouslySetInnerHTML={ { __html: 
                                        this.highlightTranslation(sentence) } }/>
                                </li>
                            )
                        }
                    </ul>
                </div>
                <div className='sidebar'>
                    <div>
                        <h3>See also</h3>

                        <ul>
                        {
                            related.map(fact => 
                                renderRelatedFact(fact, corpus, this.props.onSelectFact) 
                            ) 
                        }
                        </ul>
                    </div>
                    <div>
                        <h3>Words with similar endings</h3>

                        <ul>
                        {
                            this.wordsWithSimilarInflection().map(fact => 
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