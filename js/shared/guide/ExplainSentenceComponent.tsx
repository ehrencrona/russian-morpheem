
import FactLinkComponent from './fact/FactLinkComponent'

import Corpus from '../../shared/Corpus'
import Word from '../../shared/Word'
import Words from '../../shared/Words'
import AnyWord from '../../shared/AnyWord'
import Sentence from '../../shared/Sentence'

import Fact from '../../shared/fact/Fact'
import Inflection from '../../shared/inflection/Inflection'
import { GrammarCase, PartOfSpeech as PoS } from '../../shared/inflection/Dimensions'
import FORMS from '../../shared/inflection/InflectionForms'

import Phrase from '../../shared/phrase/Phrase'
import PhraseCase from '../../shared/phrase/PhraseCase'
import { CaseStudy } from '../../shared/phrase/PhrasePattern'
import findPotentialArticle from '../../shared/phrase/findPotentialArticle'

import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import getWordTranslationInSentence from '../../shared/getWordTranslationInSentence'

import { findWordBlocks, toStudyWords, replaceWordsWithStudyPhrase } from '../../shared/study/toStudyWords'

import StudyWord from '../../shared/study/StudyWord'
import StudyToken from '../../shared/study/StudyToken'
import StudyFact from '../../shared/study/StudyFact'
import StudyPhrase from '../../shared/study/StudyPhrase'


import { Component, createElement } from 'react';

interface Props {
    corpus: Corpus
    sentence: Sentence
    factLinkComponent: FactLinkComponent
}

interface State {
}

let React = { createElement: createElement }

export default class ExplainSentenceComponent extends Component<Props, State> {

    renderMeaningOfWord(studyWord: StudyWord, forceTranslation: boolean) {
        let word: AnyWord = studyWord.word

        if (word instanceof InflectedWord) {
            word = word.word
        }

        if (isPunctuation(word)) {
            return null
        }

        let translation = getWordTranslationInSentence(word, this.props.sentence.en())

        let translate = forceTranslation || translation != studyWord.getHint()

        let lines = [
            <div key='jp' className='jp'>{ word.toText() }</div>,
        ]

        if (translate) {
            let en = translation

            if (word.wordForm.pos == PoS.VERB) {
                en = word.getDictionaryFormOfTranslation(translation, 'inf')                
            }
            
            lines.push(<div key='en' className='en'>{ en }</div>)
        }

        return React.createElement(this.props.factLinkComponent, { fact: word.getWordFact() }, lines)
    }

    renderInflectionOfWord(studyWord: StudyWord) {
        let word: AnyWord = studyWord.word

        let result = []
        let facts = this.props.corpus.facts

        if (word instanceof InflectedWord && word != word.word.getDefaultInflection()) {
            let translation = getWordTranslationInSentence(word, this.props.sentence.en())

            let dictionaryForm = word.word.getDictionaryFormOfTranslation(translation)

            let content
            
            if (word.wordForm.pos == PoS.VERB) {
                let EN_PRON = { 1: 'I', 2: 'you', 3: 's/he/it', '1pl': 'we', '2pl': 'you (pl)', '3pl': 'they', 'pastm': 'he', 'pastf': 'she', 'pastpl': 'we/they' }
                let RU_PRON = { 1: 'я', 2: 'ты', 3: 'он/а', '1pl': 'мы', '2pl': 'вы', '3pl': 'они', 'pastm': 'он', 'pastf': 'она', 'pastpl': 'мы/вы/они' }

                content = [
                    <div key='jp' className='jp'>{ 
                        renderEnding(word.toText(), word.word.toText())   
                    }</div>
                ]

                if (facts.hasTag(word.getWordFact(), 'perfective')) {
                    translation = 'will ' + dictionaryForm
                }

                content.push(
                    <div key='en' className='en'>{ EN_PRON[word.form] + ' ' + translation }</div>)
            }
            else {
                content = [
                    <div key='jp' className='jp'>{ 
                        renderEnding(word.toText(), word.word.toText()) 
                    }</div>
                ]

                if (dictionaryForm != translation) {
                    content.push(
                        <div key='en' className='en'>{ translation }</div>)
                }
                else {
                    content.push(
                        <div key='en' className='en'>{ FORMS[word.form].name }</div>)
                }
            }

            result.push(React.createElement(this.props.factLinkComponent, 
                    { 
                        key: word.form,
                        fact: word.word.inflection.getFact(word.form), 
                        context: word 
                    },
                content))
        }

        let corpus = this.props.corpus 
        let tags = corpus.facts.getTagsOfFact(word.getWordFact())

        tags.forEach(tag => {
            let tagFact = corpus.facts.get(tag)

            if (tagFact) {
                result.push(React.createElement(this.props.factLinkComponent, 
                        { fact: tagFact, key: tag },
                    <div key={ tagFact.getId() } className='jp'>{ 
                        corpus.factoids.getFactoid(tagFact).name || tagFact.getId() 
                    }</div>))
            }
        })

        return result
    }

    getPhraseCells(studyWords: StudyToken[], sentence: Sentence) {
        let rows: StudyPhrase[][] = []

        let addRow = () => {
            let row = []

            studyWords.forEach(w => row.push(null))

            rows.push(row)

            return row
        }

        addRow()
        
        let phrases = new Set<StudyFact>()

        studyWords.forEach((word, wordIndex) => {
            word.facts.forEach(studyFact => {
                if (studyFact.fact instanceof Phrase) {
                    phrases.add(studyFact)
                }
            })
        })

        phrases.forEach(studyFact => {
            let wordIndexes: number[] = []

            studyWords.forEach((word, wordIndex) => {
                if (word.facts.indexOf(studyFact) >= 0) {
                    wordIndexes.push(wordIndex)
                }
            })

            let freeRow = rows.find(row => {
                let occupied = wordIndexes.find(index => !!row[index])

                return !occupied
            })

            if (!freeRow) {
                freeRow = addRow()
            }

            let phrase = (studyFact.fact as Phrase)

            let match = phrase.match({
                sentence: sentence,
                words: sentence.words,
                facts: this.props.corpus.facts,
                study: CaseStudy.STUDY_BOTH
            })

            let words = studyWords.map(st => st as StudyWord)
            let tokens = studyWords.slice(0)

            replaceWordsWithStudyPhrase(phrase, words, tokens,
                findWordBlocks(match, words), match)

            let lastPhrase: StudyPhrase

            tokens.forEach(maybePhrase => {

                if (maybePhrase instanceof StudyPhrase) {
                    let phrase: StudyPhrase = maybePhrase

                    // if there is an "any" but not actually a word between 
                    // the two: merge the phrases
                    if (!phrase.getHint() && lastPhrase) {
                        lastPhrase.words = lastPhrase.words.concat(phrase.words)

                        phrase = lastPhrase
                    }

                    phrase.words.forEach(word => {
                        let index = studyWords.indexOf(word)

                        if (index >= 0) {
                            freeRow[index] = phrase
                        }
                        else {
                            console.warn('Could not locate word')
                        }
                    })

                    lastPhrase = phrase
                }
                else {
                    lastPhrase = null
                }

            })

        })

        return rows
    }

    getPossibleArticle(wordIndex: number, studyWords: StudyToken[]) {
        let np = this.props.corpus.phrases.get('auto-np')

        if (!np) {
            return ''
        }

        let match = np.match({
            sentence: this.props.sentence,
            words: this.props.sentence.words.slice(wordIndex),
            facts: this.props.corpus.facts
        }, true)

        if (match) { 
            return findPotentialArticle(this.props.sentence.en(), studyWords[wordIndex].getHint())
        }
    }

    renderHeader() {
        let previousSentence
        let id = this.props.sentence.id - 1

        while (id >= 0 && !previousSentence) {
            previousSentence = this.props.corpus.sentences.get(id--)
        }

        let nextSentence
        id = this.props.sentence.id + 1

        while (id < this.props.corpus.sentences.sentences.length && !nextSentence) {
            nextSentence = this.props.corpus.sentences.get(id++)
        }

        return <div className='nav'>{
                previousSentence ? 
                    React.createElement(this.props.factLinkComponent, 
                        { fact: previousSentence }, '<<< ')
                    :
                    null 
            }
            #<a href={ '/admin.html#' + this.props.sentence.id }>{
                this.props.sentence.id   
            }</a>
            {
                nextSentence ?
                    React.createElement(this.props.factLinkComponent, 
                        { fact: nextSentence }, ' >>>')
                    :
                    null 
        }</div>
    }

    render() {
        let sentence = this.props.sentence
        
        let studyWords = toStudyWords(sentence, [], this.props.corpus)

        studyWords.forEach((studyWord, index) => {
            if (studyWord instanceof StudyWord) {
                let nextWord = studyWords[index+1]
                studyWord.en = getWordTranslationInSentence(studyWord.word, this.props.sentence.en(), 
                    nextWord instanceof StudyWord && nextWord.word)
            }
        })

        let phraseCells = this.getPhraseCells(studyWords, sentence)

        return <div className='explainSentence'>
            <div id='beforeTable'>{
                this.renderHeader()
            }</div>
            <table>
                <colgroup>
                    <col />
                    {
                        studyWords.map((sw, index) => {

                            return <col key={ index } />

                        })
                    }
                </colgroup>
                <tbody>
                    <tr className='jp'><td></td>{
                        studyWords.map((sw, index) => {

                            return <td key={ index } >{ sw.jp }</td>

                        })
                    }
                    </tr>

                    {
                        phraseCells.map((row, rowIndex) => {
                            let cells = []
                            let lastPhrase: StudyPhrase
                            let colSpan

                            let onPhrase = (studyPhrase, wordIndex) => {
                                if (lastPhrase === null) {
                                    let article = this.getPossibleArticle(wordIndex-1, studyWords)

                                    let translation = ''

                                    if (rowIndex == 0 && !phraseCells.find(row => !!row[wordIndex-1])) {
                                        let studyWord = studyWords[wordIndex-1] 
                                        let hint = studyWord.getHint()

                                        let word = (studyWord as StudyWord).word

                                        translation = (article ? '(' + article + ') ' : '') +
                                            (isPunctuation(word) ? word.jp : studyWord.getHint())
                                    }

                                    cells.push(<td key={ cells.length }>{
                                        translation 
                                    }</td>)
                                }

                                if (lastPhrase != studyPhrase) {
                                    if (lastPhrase) {
                                        cells.push(<td key={ cells.length } className='phrase' 
                                            colSpan={ colSpan } >{
                                            React.createElement(this.props.factLinkComponent, 
                                                { fact: lastPhrase.phrase },
                                                [
                                                    lastPhrase.getHint(), 
                                                    <div className='phraseName'>see "{ lastPhrase.phrase.en }"</div>
                                                ])
                                        }
                                        </td>)
                                    }

                                    colSpan = 1
                                }
                                else if (lastPhrase) {
                                    colSpan++
                                }

                                lastPhrase = studyPhrase
                            }

                            row.forEach(onPhrase)

                            onPhrase(null, row.length)

                            return <tr key={ rowIndex }><td></td>{
                                cells
                            }</tr>
                        })
                    }

                    <tr><td></td>{
                        studyWords.map((sw, index) => {

                            return <td key={ index } >{ sw instanceof StudyWord 
                                ? this.renderMeaningOfWord(sw, !!phraseCells.find(row => !!row[index])) 
                                : null }</td>

                        })
                    }</tr>

                    <tr><td></td>{
                        studyWords.map((sw, index) => {

                            return <td key={ index } >{ sw instanceof StudyWord ? this.renderInflectionOfWord(sw) : null }</td>

                        })
                    }</tr>

                </tbody>
            </table>
            <div id='afterTable'>
                <div className='manualTranslation'>{
                    this.props.sentence.en()
                }</div>
            </div>
        </div>
    }

}

function isPunctuation(word: AnyWord) {
    return word.isPunctuation()
}

function renderEnding(inflected, base: string) {
    let len = Math.min(inflected.length, base.length)

    let lastCommonIndex = 0

    for (lastCommonIndex = 0; 
        lastCommonIndex < len && inflected[lastCommonIndex] == base[lastCommonIndex]; 
        lastCommonIndex++) {
    }

    if (lastCommonIndex == 0) {
        return inflected
    }

    return <span className='formation'>{
            base.substr(0, lastCommonIndex) 
        }<span className='removed'>{ 
            base.substr(lastCommonIndex) 
        }</span><span className='added'>{
            inflected.substr(lastCommonIndex)
        }</span>
    </span>
}