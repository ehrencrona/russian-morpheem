import InflectionFact from '../../shared/inflection/InflectionFact'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import { InflectionForm, CASES, FORMS, Tense, Number, Gender } from '../../shared/inflection/InflectionForms'

import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import Words from '../../shared/Words'
import Sentence from '../../shared/Sentence'
import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
import WordMatch from '../../shared/phrase/WordMatch'
import PhraseCase from '../../shared/phrase/PhraseCase'
import { Match, CaseStudy, WordMatched } from '../../shared/phrase/PhrasePattern'

import StudyFact from './StudyFact'
import StudyWord from './StudyWord'
import StudyPhrase from './StudyPhrase'
import CaseStudyMatch from '../../shared/phrase/CaseStudyMatch'

import getFormHint from './getFormHint'

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

    let result = {
        id: word.getId(),
        jp: word.jp,
        getHint: () => word.getEnglish(),
        getFormHint: () => getFormHint(word, words, studiedFacts),
        form: (word instanceof InflectedWord ? FORMS[word.form] : null),
        facts: facts,
        wordFact: word
    }

    word.visitFacts((fact: Fact) => {
        if (isWorthExplaining(fact, word)) {
            facts.push({ fact: fact, words: [ result ] })
        }
    })

    return result
}

interface WordBlock {
    caseStudy: boolean,
    start: number,
    end: number
    words: StudyWord[],
    match: WordMatch
}

function findWordBlocks(wordMatch: Match, phraseMatch: Match, words: StudyWord[]) {
    let result: WordBlock[] = []

    phraseMatch.words.forEach((m) => {

        let block: WordBlock

        let i = m.index

        let isCaseStudy = wordMatch.words.findIndex((n) => i == n.index) < 0

        if (result.length &&
            i == result[result.length-1].end &&
            m.wordMatch.isCaseStudy() &&
            m.wordMatch == result[result.length-1].match) {

            block = result[result.length-1]

            block.words.push(words[i])
            block.end = i+1
        }
        else {
            block = {
                start: i,
                end: i+1,
                caseStudy: isCaseStudy,
                words: [ words[i] ],
                match: m.wordMatch
            }

            result.push(block)
        }

    })

    return result
}

function replaceWordsWithStudyPhrase(phrase: Phrase, words: StudyWord[], wordBlocks: WordBlock[], phraseMatch: Match, wordMatch: Match) {
    let fragments = phraseMatch.pattern.getEnglishFragments()

    let atWordBlock = 0, atFragment = 0
    let wordIndexAdjust = 0

    while (atWordBlock < wordBlocks.length || atFragment < fragments.length) {
        let wordBlock = wordBlocks[atWordBlock]
        let englishBlock = fragments[atFragment]

        let blockStart = (wordBlock ? wordBlock.start + wordIndexAdjust : null)
        let blockEnd = (wordBlock ? wordBlock.end + wordIndexAdjust : null)

        if ((!wordBlock || (englishBlock && wordBlock.caseStudy)) && 
                !englishBlock.placeholder) {
            // add an English text block with no corresponding Russian text
            let start
            
            if (wordBlock) {
                start = wordBlock.start 
            }
            else if (wordBlocks.length > 0) {
                start = wordBlocks[wordBlocks.length-1].end
            }
            else {
                start = 0
            }

            words.splice(start + wordIndexAdjust, 0, new StudyPhrase(phrase, englishBlock.en(phraseMatch), []))
            wordIndexAdjust++

            atFragment++
        }
        else if (!wordBlock) {
            console.error(`More English blocks than words block in ${phrase.getId()}. Could not place ${englishBlock.en(phraseMatch)}`)

            words.push(new StudyPhrase(phrase, englishBlock.en(phraseMatch), []))
            atFragment++
        }
        else if (!englishBlock ||
            (!wordBlock.caseStudy && englishBlock.placeholder)) {
            // add a Russian text block with English equivalent.
            words.splice(blockStart, wordBlock.end - wordBlock.start, 
                new StudyPhrase(phrase, '', 
                    words.slice(blockStart, blockEnd)))

            wordIndexAdjust += 1 - (wordBlock.end - wordBlock.start)

            atWordBlock++
        }
        else if (wordBlock.caseStudy && englishBlock.placeholder) {
            // case study block: retain Russian words
            wordBlock.words.forEach((word) => {
                word.facts.push({
                    fact: phrase.getCaseFact(word.form.grammaticalCase),
                    words: wordBlock.words
                })
            })

            atWordBlock++
            atFragment++
        }
        else if (!wordBlock.caseStudy && !englishBlock.placeholder) {
            // add an English text block for Russian text
            words.splice(blockStart, wordBlock.end - wordBlock.start, 
                new StudyPhrase(phrase, englishBlock.en(phraseMatch), 
                    words.slice(blockEnd, blockEnd)))

            wordIndexAdjust += 1 - (wordBlock.end - wordBlock.start)

            atFragment++
            atWordBlock++
        }
        else {
            console.error('Unexpected case.')
            break
        }
    }
}

export default function toStudyWords(sentence: Sentence, studiedFacts: Fact[], corpus: Corpus, ignorePhrases?: boolean): StudyWord[] {
    let words: StudyWord[] = []
    
    sentence.words.forEach((word) => words.push(wordToStudyWord(word, words, studiedFacts)))

    let handlePhrase = (phrase) => {
        let phraseMatch: Match = phrase.match(sentence.words, corpus.facts, CaseStudy.STUDY_BOTH)

        if (!phraseMatch) {
            console.warn(phrase + ' does not match ' + sentence + '.')
            return
        }

        let wordMatch: Match = phrase.match(sentence.words, corpus.facts, CaseStudy.STUDY_WORDS)

        if (!wordMatch) {
            wordMatch = {
                words: [],
                pattern: null
            }
        }

        let wordBlocks: WordBlock[] = findWordBlocks(wordMatch, phraseMatch, words)

        if (!!studiedFacts.find((f) => f.getId() == phrase.getId())) {
            replaceWordsWithStudyPhrase(phrase, words, wordBlocks, phraseMatch, wordMatch)
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
                    words[m.index].facts.push(caseFacts[caseStudied])
                }

                // TODO: or there are words but the words are all placeholders [verb] [someone] [something])
                if (!m.wordMatch.isCaseStudy() || !wordsFact.words.length) {
                    words[m.index].facts.push(wordsFact)
                }
            })
        }
    }

    if (!ignorePhrases) {
        sentence.phrases.forEach((p) => { 
            if (!studiedFacts.find((f) => f.getId() == p.getId())) {
                handlePhrase(p)
            }
        })
    }

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

    if (Words.PUNCTUATION.indexOf(words[words.length-1].jp) < 0) {
        let fullStop = corpus.words.get('.')

        if (fullStop) {
            words.push(wordToStudyWord(fullStop, words, studiedFacts))
        }
    }

    return words
}
