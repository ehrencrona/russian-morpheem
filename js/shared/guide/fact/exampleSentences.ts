import InflectableWord from '../../../shared/InflectableWord'
import Fact from '../../../shared/fact/Fact'
import { Knowledge } from '../../../shared/study/Exposure'

import Inflection from '../../../shared/inflection/Inflection'
import Sentence from '../../../shared/Sentence'

import SentenceScore from '../../../shared/study/SentenceScore'
import KnowledgeSentenceSelector from '../../../shared/study/KnowledgeSentenceSelector'
import topScores from '../../../shared/study/topScores'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'

import InflectedWord from '../../../shared/InflectedWord'
import Phrase from '../../../shared/phrase/Phrase'
import findPhrasesWithWord from '../../../shared/phrase/findPhrasesWithWord'

import htmlEscape from '../../../shared/util/htmlEscape'
import Words from '../../../shared/Words'

import StudyToken from '../../study/StudyToken'
import StudyWord from '../../study/StudyWord'
import StudyPhrase from '../../study/StudyPhrase'

import StudyFact from '../../study/StudyFact'

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

export function highlightTranslation(sentence: TokenizedSentence) {
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
