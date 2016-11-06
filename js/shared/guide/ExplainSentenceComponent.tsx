
import FactLinkComponent from './fact/FactLinkComponent'

import Corpus from '../../shared/Corpus'
import Word from '../../shared/Word'
import Words from '../../shared/Words'
import AnyWord from '../../shared/AnyWord'
import Sentence from '../../shared/Sentence'

import Fact from '../../shared/fact/Fact'
import Inflection from '../../shared/inflection/Inflection'
import { FORMS } from '../../shared/inflection/InflectionForms'

import Phrase from '../../shared/phrase/Phrase'
import PhraseCase from '../../shared/phrase/PhraseCase'
import { CaseStudy } from '../../shared/phrase/PhrasePattern'

import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'

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

export default class InflectionTableComponent extends Component<Props, State> {

    renderMeaningOfWord(studyWord: StudyWord) {
        let word: AnyWord = studyWord.word

        if (word instanceof InflectedWord) {
            word = word.word
        }

        if (Words.PUNCTUATION.indexOf(word.toText()) >= 0) {
            return null
        } 

        return React.createElement(this.props.factLinkComponent, { fact: word.getWordFact() }, 
            [
                <div key='jp' className='jp'>{ word.toText() }</div>,
                <div key='en' className='en'>{ word.getEnglish() }</div>
            ])
    }

    renderInflectionOfWord(studyWord: StudyWord) {
        let word: AnyWord = studyWord.word

        if (word instanceof InflectedWord && word.form != word.word.inflection.defaultForm) {
            return React.createElement(this.props.factLinkComponent, 
                    { fact: word.word.inflection.getFact(word.form), context: word },
                <div key='jp' className='jp'>{ FORMS[ word.form ].name }</div>)
        }
    }

    getPhraseCells(studyWords: StudyToken[], sentence: Sentence) {
        let rows: StudyPhrase[][] = []

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
                freeRow = []

                studyWords.forEach(w => freeRow.push(null))

                rows.push(freeRow)
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

            tokens.forEach(maybePhrase => {

                if (maybePhrase instanceof StudyPhrase) {

                    maybePhrase.words.forEach(word => {

                        let index = studyWords.indexOf(word)

                        if (index >= 0) {
                            freeRow[index] = maybePhrase
                        }
                        else {
                            console.warn('Could not locate word')
                        }

                    })

                }

            })

        })

        return rows
    }

    render() {
        let sentence = this.props.sentence
        
        let studyWords = toStudyWords(sentence, [], this.props.corpus)

        let phraseCells = this.getPhraseCells(studyWords, sentence)

        return <table className='explainSentence'>
            <colgroup>
                {
                    studyWords.map((sw, index) => {

                        return <col key={ index } />

                    })
                }
            </colgroup>
            <tbody>
                <tr className='jp'>{
                    studyWords.map((sw, index) => {

                        return <td key={ index } >{ sw.jp }</td>

                    })
                }
                </tr>

                <tr>{
                    studyWords.map((sw, index) => {

                        return <td key={ index } >{ sw instanceof StudyWord ? this.renderMeaningOfWord(sw) : null }</td>

                    })
                }</tr>

                <tr>{
                    studyWords.map((sw, index) => {

                        return <td key={ index } >{ sw instanceof StudyWord ? this.renderInflectionOfWord(sw) : null }</td>

                    })
                }</tr>

                {
                    phraseCells.map((row, index) => {
                        let cells = []
                        let lastPhrase: StudyPhrase
                        let colSpan

                        let onPhrase = studyPhrase => {
                            if (lastPhrase === null) {
                                cells.push(<td key={ cells.length }></td>)
                            }

                            if (lastPhrase != studyPhrase) {
                                if (lastPhrase) {
                                    cells.push(<td key={ cells.length } className='phrase' 
                                        colSpan={ colSpan } >{
                                        React.createElement(this.props.factLinkComponent, 
                                            { fact: lastPhrase.phrase },
                                            [
                                                lastPhrase.getHint(), 
                                                <div className='phraseName'>{ lastPhrase.phrase.en }</div>
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

                        onPhrase(null)

                        return <tr key={ index }>{
                            cells
                        }</tr>
                    })
                }
            </tbody>
        </table>

    }

}