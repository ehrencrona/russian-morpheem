import { AbstractAnyWord } from '../../AbstractAnyWord';
import { FactSentences } from '../../SentencesByFactIndex';
import { AdjectiveForm, GrammarCase, Tense } from '../../inflection/Dimensions';
import { Match, WordMatched } from '../../phrase/Match';
import { PUNCTUATION, PUNCTUATION_NOT_PRECEDED_BY_SPACE } from '../../Punctuation';
import InflectableWord from '../../../shared/InflectableWord'
import Fact from '../../../shared/fact/Fact'
import { Knowledge } from '../../../shared/study/Exposure'
import mapFind from '../../../shared/mapFind'

import Inflection from '../../../shared/inflection/Inflection'
import InflectionForm from '../../../shared/inflection/InflectionForm'
import FORMS from '../../../shared/inflection/InflectionForms'
import InflectionFact from '../../../shared/inflection/InflectionFact'
import Sentence from '../../../shared/Sentence'
import Corpus from '../../../shared/Corpus'

import SentenceScore from '../../../shared/study/SentenceScore'
import KnowledgeSentenceSelector from '../../../shared/study/KnowledgeSentenceSelector'
import topScores from '../../../shared/study/topScores'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'

import InflectedWord from '../../../shared/InflectedWord'
import Phrase from '../../../shared/phrase/Phrase'
import findPhrasesWithWord from '../../../shared/phrase/findPhrasesWithWord'

import htmlEscape from '../../../shared/util/htmlEscape'
import Words from '../../../shared/Words'
import Word from '../../../shared/Word'
import AnyWord from '../../../shared/AnyWord'
import { NamedWordForm } from '../../../shared/inflection/WordForm'
import { PartOfSpeech as PoS } from '../../../shared/inflection/Dimensions'

import StudyToken from '../../study/StudyToken'
import StudyWord from '../../study/StudyWord'
import StudyPhrase from '../../study/StudyPhrase'
import toStudyWords from '../../study/toStudyWords'

import StudyFact from '../../study/StudyFact'
import { Component, createElement } from 'react'

import FactLinkComponent from './FactLinkComponent'

let React = { createElement: createElement }

export interface TokenizedSentence {
    sentence: Sentence,
    tokens: StudyToken[]
}

export function downscoreRepeatedWord(scores: SentenceScore[], wordMatches: (word) => boolean) {
    let foundCountByWord = {}

    return scores.map(score => {

        let wordInSentence = score.sentence.words.find(wordMatches)

        if (wordInSentence) {
            let inflectionForm = wordInSentence.toText()

            if (!foundCountByWord[inflectionForm]) {
                foundCountByWord[inflectionForm] = 1
            }
            else {
                foundCountByWord[inflectionForm]++
            }

            if (foundCountByWord[inflectionForm] > 2) {
                score.score = score.score / 2
            }
        }

        return score 

    })
}

export function tokensToHtml(tokens: StudyToken[]) {
    function isWordWithSpaceBefore(word: StudyToken) {
        if (word instanceof StudyWord ) {
            return !(word.jp.length == 1 && PUNCTUATION_NOT_PRECEDED_BY_SPACE.indexOf(word.jp) >= 0)
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

export function highlightTranslation(sentence: TokenizedSentence) {
    let result = htmlEscape(sentence.sentence.en())

    sentence.tokens.forEach(t => {

        if (t instanceof StudyWord && t.studied) {
            let word = t.word

            for (let i = 0; i < word.getTranslationCount(); i++) {
                let separator = '([\\\s' + PUNCTUATION + ']|^|$)'
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

interface ScoredMatch extends SentenceScore {
    match: Match
}

export function sortByKnowledge(matches: Match[], knowledge: NaiveKnowledge): Match[] {
    if (knowledge.isEmpty()) {
        return matches
    }

    let scores: ScoredMatch[]

    if (matches.length) {
        scores = matches.map(match => 
            {
                return {
                    sentence: match.sentence,
                    match: match,
                    // remove?
                    fact: null,
                    score: 1
                }
            })

        scores = new KnowledgeSentenceSelector(knowledge).scoreSentences(scores)
    }
    else {
        scores = []
    }

    return scores.map(s => s.match)
}

/**
 * Returns a list of Match objects containing the word of sentences matching a certain filter criterion that selects certain words.
 * If filterPhrases is set, the match objects will contain the entire phrase of the match (if any). 
 */
export function getMatchesForCertainWords(
        filterWords: (words: Word[]) => Word[],
        filterPhrases: (Phrase) => boolean,
        factSentences: FactSentences, 
        knowledge: NaiveKnowledge, 
        corpus: Corpus,
        onlyPhraseMatches?: boolean, addPhrase?: Phrase): Match[] {
    let sentences: Sentence[]
    
    if (factSentences) {
        sentences = factSentences.easy
            .concat(factSentences.ok)
                .concat(factSentences.hard).map(sd => sd.sentence)
    }
    else {
        sentences = corpus.sentences.sentences
    }

    let matches: Match[] = sentences.map(sentence => {
        let matchingWords = filterWords(sentence.words)

        if (!matchingWords.length) {
            return
        }

        if (filterPhrases) {
            let phrases = sentence.phrases

            if (addPhrase) {
                phrases = phrases.concat(addPhrase)
            }

            let match = mapFind(phrases, (phrase: Phrase) => {
                if (filterPhrases(phrase)) {
                    let m = corpus.sentences.match(sentence, phrase, corpus.facts)

                    if (m && filterWords(m.words.map(w => w.word)).length) {
                        return m
                    }
                }
            })

            if (match) {
                return match
            }
        }

        if (!onlyPhraseMatches) {
            let wordsMatched: WordMatched[] = 
                matchingWords.map(word => {
                    let m: WordMatched = {
                        word: word,
                        wordMatch: null,
                        index: 0,
                    }

                    return m
                })

            return {
                words: wordsMatched,
                pattern: null,
                sentence: sentence,
            } as Match
        }
    }).filter(m => !!m)

    matches = sortByKnowledge(matches, knowledge)

    return matches
}

export function renderMatch(highlight: Fact, 
        corpus: Corpus, factLinkComponent: FactLinkComponent) {
    return (match: Match) => {
        let sentence = match.sentence
        let ignorePhrases = true

        let tokens = toStudyWords(sentence, [ highlight ], corpus, ignorePhrases)

        if (highlight instanceof NamedWordForm) {
            tokens.forEach(token => {
                if (token instanceof StudyWord) {
                    let word = token.word 
                    
                    if (word instanceof AbstractAnyWord && word.wordForm.matches(highlight)) {
                        token.studied = true
                    }
                } 
            })
        }

        let tokenized = {
            sentence: sentence,
            tokens: tokens
        }

        return <li key={ sentence.id }>
                {
                    React.createElement(factLinkComponent, { fact: sentence }, 
                        <div dangerouslySetInnerHTML={ { __html: 
                            tokensToHtml(tokenized.tokens)
                        }}/>)
                }
                <div className='en' dangerouslySetInnerHTML={ { __html: 
                    highlightTranslation(tokenized) } }/>
            </li>
    }
}

export function getFilterPhrasesForInflectionForm(form: InflectionForm) {
    let filterPhrases = null

    if (form.grammaticalCase && form.grammaticalCase != GrammarCase.NOM) {
        filterPhrases = (phrase: Phrase) => phrase.hasCase(form.grammaticalCase)
    }
    else if (form.adjectiveForm || form.command || form.pos == PoS.ADVERB ) {
        filterPhrases = () => true
    }

    return filterPhrases
}

/**
 * Returns Match objects with all sentences that have words with a certain inflection form.
 */
export function getMatchesForInflectionForm(filterPhrases: (Phrase) => boolean,
        form: InflectionForm, knowledge: NaiveKnowledge, corpus: Corpus) {
    let filterWords = (words) => words.filter(
        w => w instanceof InflectedWord && form.matches(FORMS[w.form]))

    let sbf = corpus.sentences.getSentencesByFact(corpus.facts)
    let mostDiscriminating: FactSentences

    let visit = (fact) => {
        let factSentences = sbf[fact.getId()]

        if (!mostDiscriminating || factSentences.count < mostDiscriminating.count) {
            mostDiscriminating = factSentences
        }
    }

    new InflectionFact('foo', null, form.id).visitFacts(visit)

    if (!mostDiscriminating) {
        console.error('Could not find any indexed sentences for word form ' + form.id)
    }

    if (mostDiscriminating && mostDiscriminating.count > 1000) {
        mostDiscriminating = Object.assign({}, mostDiscriminating)
        
        mostDiscriminating.easy = mostDiscriminating.easy
            .concat(mostDiscriminating.ok)
                .concat(mostDiscriminating.hard).slice(0, 1000)

        mostDiscriminating.ok = []
        mostDiscriminating.hard = []
    }

    return getMatchesForCertainWords(filterWords, filterPhrases,
        mostDiscriminating, knowledge, corpus)
}


/**
 * Returns Match objects with all sentences that have words with a certain inflection fact (=ending and case)
 */
export function getMatchesForInflectionFact(
        fact: InflectionFact, knowledge: NaiveKnowledge, corpus: Corpus) {
    let filterWords = (words) => words.filter(
        w => w instanceof InflectedWord && 
            w.form == fact.form &&
            w.word.inflection.getFact(w.form).getId() == fact.getId())

    let sbf = corpus.sentences.getSentencesByFact(corpus.facts)

    if (!sbf[fact.getId()]) {
        return []
    }

    let filterPhrases = null

    return getMatchesForCertainWords(filterWords, filterPhrases,
        sbf[fact.getId()], knowledge, corpus)
}

export function getFilterPhrasesForWordForm(form: NamedWordForm) {
    let filterPhrases = null

    if (form.pos == PoS.PRONOUN || form.pos == PoS.PREPOSITION || 
        form.pos == PoS.POSSESSIVE || form.pos == PoS.NUMBER) {
        filterPhrases = () => true
    }

    return filterPhrases
}

/**
 * Returns Match objects with all sentences that have words with a certain word form.
 */
export function getMatchesForWordForm(filterPhrases: (Phrase) => boolean,
        form: NamedWordForm, knowledge: NaiveKnowledge, corpus: Corpus) {
    let filterWords = (words) => words.filter(
        w => w instanceof AbstractAnyWord && w.wordForm.matches(form))

    return getMatchesForCertainWords(filterWords, filterPhrases,
        null, knowledge, corpus)
}

/**
 * Returns Match objects with all sentences that have a certain word.
 */
export function getMatchesForWord(
        word: AnyWord, knowledge: NaiveKnowledge, corpus: Corpus, addPhrase?: Phrase) {
    let wordFactId = word.getWordFact().getId()
    let filterWords = (words) => words.filter(
        w => w.getWordFact().getId() == wordFactId)

    let filterPhrases = () => true

    let sbf = corpus.sentences.getSentencesByFact(corpus.facts)

    if (!sbf[wordFactId]) {
        return []
    }

    return getMatchesForCertainWords(filterWords, filterPhrases,
        sbf[word.getWordFact().getId()], knowledge, corpus)
}

