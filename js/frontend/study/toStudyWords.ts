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
    caseStudy: boolean,
    start: number,
    end: number
    words: StudyWord[],
    match: WordMatch
}

function findWordBlocks(phraseMatch: Match, words: StudyWord[]) {
    let result: WordBlock[] = []

    phraseMatch.words.forEach((m) => {

        let block: WordBlock

        let i = m.index

        let isCaseStudy = m.wordMatch.isCaseStudy()

        if (result.length &&
            i == result[result.length-1].end &&
            ((m.wordMatch.isCaseStudy() &&
                m.wordMatch == result[result.length-1].match) ||
                !m.wordMatch.isCaseStudy() && !result[result.length-1].match.isCaseStudy()
            )) {

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

function replaceWordsWithStudyPhrase(phrase: Phrase, words: StudyWord[], tokens: StudyToken[], wordBlocks: WordBlock[], phraseMatch: Match) {
    let fragments = phraseMatch.pattern.getEnglishFragments()

    let atWordBlock = 0, atFragment = 0
    let wordIndexAdjust = 0

    while (atWordBlock < wordBlocks.length || atFragment < fragments.length) {
        let wordBlock = wordBlocks[atWordBlock]
        let englishBlock: EnglishPatternFragment = fragments[atFragment]

        let blockStart = tokens.findIndex(t => t === words[wordBlock.start]) 
        let blockEnd = blockStart + wordBlock.end - wordBlock.start

        if ((!wordBlock || (englishBlock && wordBlock.caseStudy)) && 
                !englishBlock.placeholder) {
            // add an English text block with no corresponding Russian text
            let start
            
            if (wordBlock) {
                start = blockStart
            }
            else if (wordBlocks.length > 0) {
                // WRONG
                start = blockStart-1
            }
            else {
                start = 0
            }

            tokens.splice(start + wordIndexAdjust, 0, new StudyPhrase(phrase, englishBlock.en(phraseMatch), [], true))
            wordIndexAdjust++

            atFragment++
        }
        else if (!wordBlock) {
            console.error(`More English blocks than token block in ${phrase.getId()}. Could not place ${englishBlock.en(phraseMatch)}`)

            tokens.push(new StudyPhrase(phrase, englishBlock.en(phraseMatch), [], true))

            atFragment++
        }
        else if (!englishBlock ||
            (!wordBlock.caseStudy && englishBlock.placeholder)) {
            // add a Russian text block with no English equivalent.
            tokens.splice(blockStart, wordBlock.end - wordBlock.start, 
                new StudyPhrase(phrase, '', 
                    words.slice(wordBlock.start, wordBlock.end), true))

            wordIndexAdjust += 1 - (wordBlock.end - wordBlock.start)

            atWordBlock++
        }
        else if (wordBlock.caseStudy && englishBlock.placeholder) {
            // case study block: retain Russian word
            let inflectedWord = wordBlock.words.find(w => w.form && w.form.grammaticalCase != GrammaticalCase.NOM)

            if (inflectedWord) {
                let grammaticalCase = inflectedWord.form.grammaticalCase 

                wordBlock.words.forEach((word) => {
                    let caseFact = phrase.getCaseFact(grammaticalCase)

                    // unfortunately, we don't know this earlier
                    caseFact.placeholderName = englishBlock.en(phraseMatch)

                    let wordFact = word.word

                    if (englishBlock.placeholderOverrideForm && wordFact instanceof InflectedWord) {
                        word.getHint = () => {
                            let inflected = wordFact.word.inflect(englishBlock.placeholderOverrideForm)

                            if (inflected) {
                                return inflected.getEnglish()
                            }
                            else {
                                console.warn(`Phrase ${phrase.id} specified form ${englishBlock.placeholderOverrideForm} that did not exist for ${wordFact}.`)

                                return wordFact.getEnglish()
                            }
                        }
                    }

                    word.facts.push({
                        fact: caseFact,
                        words: wordBlock.words
                    })
                })

                atWordBlock++
                atFragment++
            }
            else {
                console.warn(`No inflected word in ${ wordBlock.words.map(w => w.jp).join(' ') } despite being case study (phrase: ${phrase.getId()}).`)
                atWordBlock++
            }
        }
        else if (!wordBlock.caseStudy && !englishBlock.placeholder) {
            // add an English text block for Russian text
            tokens.splice(blockStart, wordBlock.end - wordBlock.start, 
                new StudyPhrase(phrase, englishBlock.en(phraseMatch), 
                    words.slice(wordBlock.start - wordBlock.end), true))

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

export default function toStudyWords(sentence: Sentence, studiedFacts: Fact[], corpus: Corpus, ignorePhrases?: boolean): StudyToken[] {
    let words: StudyWord[] = []
    
    sentence.words.forEach((word) => words.push(wordToStudyWord(word, words, studiedFacts)))

    words.forEach(word => {
        studiedFacts.forEach(fact => {
            if (word.hasFact(fact)) {
                word.studied = true
            }
        })
    })

    let tokens: StudyToken[] = words.slice(0)

    let handlePhrase = (phrase: Phrase) => {
        let phraseMatch: Match = phrase.match({ sentence: sentence, words: sentence.words, facts: corpus.facts, study: CaseStudy.STUDY_BOTH })

        if (!phraseMatch) {
            console.warn(phrase + ' does not match ' + sentence + '.')
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
                }

                // TODO: or there are words but the words are all placeholders [verb] [someone] [something])
                if (!m.wordMatch.isCaseStudy()) {
                    words[m.index].addFact(wordsFact)
                }
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

    if (Words.PUNCTUATION.indexOf(words[words.length-1].jp) < 0) {
        let fullStop = corpus.words.get('.')

        if (fullStop) {
            tokens.push(wordToStudyWord(fullStop, words, studiedFacts))
        }
    }

    return tokens
}
