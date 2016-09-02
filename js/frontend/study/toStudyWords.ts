import InflectionFact from '../../shared/inflection/InflectionFact'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import { InflectionForm, CASES, FORMS, Tense, Number, Gender, GrammaticalCase } from '../../shared/inflection/InflectionForms'

import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import Words from '../../shared/Words'
import Sentence from '../../shared/Sentence'
import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
import PhraseCase from '../../shared/phrase/PhraseCase'
import EnglishPatternFragment from '../../shared/phrase/EnglishPatternFragment' 
import WordMatch from '../../shared/phrase/WordMatch'
import PhraseMatch from '../../shared/phrase/PhraseMatch'
import { CaseStudy } from '../../shared/phrase/PhrasePattern'
import { Match, WordMatched } from '../../shared/phrase/Match'

import StudyFact from './StudyFact'
import StudyWord from './StudyWord'
import StudyPhrase from './StudyPhrase'
import StudyToken from './StudyToken'
import CaseStudyMatch from '../../shared/phrase/CaseStudyMatch'

function isWorthExplaining(fact: Fact, word: Word) {
    if ((fact instanceof Word || fact instanceof InflectableWord) && !fact.studied) {
        return false
    }

    return !(fact instanceof InflectionFact &&
        word instanceof InflectedWord &&
        // can't check the default form of the inflection since it might be masked, 
        // so we have to get the default form of the word
        word.getDefaultInflection().form == fact.form)
}

export function wordToStudyWord(word: Word, words: StudyWord[], studiedFacts: Fact[]): StudyWord {
    let facts: StudyFact[] = []

    return new StudyWord(word, false)
}

export interface WordBlock {
    start: number
    end: number
    words: StudyWord[]
    match: WordMatch
}

function findWordBlocks(phraseMatch: Match, words: StudyWord[], offset?: number) {
    let result: WordBlock[] = []
    offset = offset || 0
    let lastMatchIndex

    phraseMatch.words.forEach((m) => {
        let block: WordBlock

        let wordIndex = m.index
        let matchIndex = phraseMatch.pattern.wordMatches.indexOf(m.wordMatch)

        if (result.length &&
            /* we skip a match index if any is a matcher */
            matchIndex <= lastMatchIndex+1 && 
            wordIndex+offset == result[result.length-1].end) {
            block = result[result.length-1]

            block.words.push(words[wordIndex])
            block.end = wordIndex+1+offset
        }
        else {
            block = {
                start: wordIndex+offset,
                end: wordIndex+1+offset,
                words: [ words[wordIndex] ],
                match: m.wordMatch
            }

            result.push(block)
        }

        lastMatchIndex = matchIndex
    })

    return result
}

function replaceWordsWithStudyPhrase(phrase: Phrase, words: StudyWord[], tokens: StudyToken[], wordBlocks: WordBlock[], phraseMatch: Match) {
    let fragments = phraseMatch.pattern.getEnglishFragments()

    let atWordBlock = 0, atFragment = 0
    let wordIndexAdjust = 0
    let lastWordBlock: WordBlock

    while (atWordBlock < wordBlocks.length || atFragment < fragments.length) {
        
        let wordBlock = wordBlocks[atWordBlock]
        let englishBlock: EnglishPatternFragment = fragments[atFragment]

        let blockStart, blockEnd
        
        if (wordBlock) {
            blockStart = tokens.findIndex(t => t === words[wordBlock.start]) 
            blockEnd = blockStart + wordBlock.end - wordBlock.start
        }

        if (!wordBlock) {
            // add an English text block with no corresponding Russian text
            tokens.push(new StudyPhrase(phrase, englishBlock.en(phraseMatch), [], true))
            wordIndexAdjust++

            atFragment++
        }
        else {
            let en: string

            if (!englishBlock) {
                en = ''
            }
            else {
                en = englishBlock.en(phraseMatch)
                atFragment++
            }

            let phraseWords = words.slice(wordBlock.start, wordBlock.end)

            tokens.splice(blockStart, wordBlock.end - wordBlock.start, 
                new StudyPhrase(phrase, en, phraseWords, true))

            phraseWords.forEach(w => {
                w.studied = true
                w.addFact({ fact: phrase, words: phraseWords })
            })

            wordIndexAdjust += 1 - (wordBlock.end - wordBlock.start)

            atWordBlock++
        }

        lastWordBlock = wordBlock
    }
}

export default function toStudyWords(sentence: Sentence, studiedFacts: Fact[], corpus: Corpus, ignorePhrases?: boolean): StudyToken[] {
    let words: StudyWord[] = []
    
    sentence.words.forEach((word) => words.push(wordToStudyWord(word, words, studiedFacts)))

    let tokens: StudyToken[] = words.slice(0)

    let handlePhrase = (phrase: Phrase) => {
        let phraseMatch: Match = phrase.match({ sentence: sentence, words: sentence.words, facts: corpus.facts, study: CaseStudy.STUDY_BOTH })

        if (!phraseMatch) {
            console.warn(`Phrase ${phrase.id} does not match sentence ${sentence.id}.`)
            return
        }

        let wordBlocks: WordBlock[] = findWordBlocks(phraseMatch, words)

        if (!!studiedFacts.find((f) => f.getId() == phrase.getId())) {
            replaceWordsWithStudyPhrase(phrase, words, tokens, wordBlocks, phraseMatch)
        }
        else {
            let wordsFact: StudyFact = { fact: phrase, words: [] } 
            let caseFacts: { [id: string]: StudyFact } = {}

            phraseMatch.words.forEach((m) => {
                if (m.wordMatch.isCaseStudy()) {
                    let caseStudied = ((m.wordMatch as any) as CaseStudyMatch).getCaseStudied() 

                    if (!caseFacts[caseStudied]) {
                        caseFacts[caseStudied] = {
                            fact: phrase.getCaseFact(caseStudied),
                            words: []
                        }
                    }

                    caseFacts[caseStudied].words.push(words[m.index])
                }
                else {
                    wordsFact.words.push(words[m.index])
                }
            })

            phraseMatch.words.forEach((m) => {
                if (m.wordMatch.isCaseStudy()) {
                    let caseStudied = ((m.wordMatch as any) as CaseStudyMatch).getCaseStudied() 

                    words[m.index].addFact(caseFacts[caseStudied])

                    let wordMatch = m.wordMatch

                    if (wordMatch instanceof PhraseMatch &&
                        !!studiedFacts.find((f) => f.getId() == caseFacts[caseStudied].fact.getId())) {
                        replaceWordsWithStudyPhrase(wordMatch.phrase, words, tokens, findWordBlocks(m.childMatch, words, m.index), m.childMatch)
                    }
                }

                words[m.index].addFact(wordsFact)
            })
        }
    }

    // handle unstudied phrases
    if (!ignorePhrases) {
        sentence.phrases.forEach((p) => { 
            if (!studiedFacts.find((f) => f.getId() == p.getId())) {
                handlePhrase(p)
            }
        })
    }

    // handle studied phrases
    let phraseCount = 0

    studiedFacts.forEach((studiedFact) => {
        if (studiedFact instanceof Phrase) {
            if (phraseCount > 0) {
                console.log('studying more than one phrase at a time: ' + studiedFacts.map((f) => f.getId()))
            }
            else {
                // needs to be done last since indexes change.
                handlePhrase(studiedFact)
                
                phraseCount++
            }
        }
    })

    words.forEach(word => {
        studiedFacts.forEach(fact => {
            if (word.hasFact(fact)) {
                word.studied = true
            }
        })
    })

    if (Words.PUNCTUATION.indexOf(words[words.length-1].jp) < 0) {
        let fullStop = corpus.words.get('.')

        if (fullStop) {
            tokens.push(wordToStudyWord(fullStop, words, studiedFacts))
        }
    }

    return tokens
}
