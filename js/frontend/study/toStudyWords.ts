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
import PhraseCase from '../../shared/phrase/PhraseCase'
import { Match, CaseStudy, WordMatched } from '../../shared/phrase/PhrasePattern'

import UnknownFact from './UnknownFact'
import StudyWord from './StudyWord'
import StudyPhrase from './StudyPhrase'
import CaseStudyMatch from '../../shared/phrase/CaseStudyMatch'

export function getFormHint(forWord: Word, words: StudyWord[], studiedFact: Fact): string {
    let fact = studiedFact

    if (forWord instanceof InflectedWord) {
        let form = FORMS[forWord.form]

        if (!form) {
            console.warn(`Unknown form ${ forWord.form }.`)
            return ''
        }

        let targetTense = form.tense
        let targetNumber = form.number
        let targetGender = form.gender

        let tenseHintNeeded = !!targetTense
        let numberHintNeeded = !!targetNumber

        // we will need to know the gender of nouns for this to work, we don't yet.
        let genderHintNeeded = false

        words.forEach((word) => {

            if (word.form) {
                let wordFact = word.wordFact

                if (isStudiedWord(forWord, fact)) {
                    return 
                }

                let form = word.form

                if (tenseHintNeeded && form.tense != null && form.tense == targetTense) {
                    tenseHintNeeded = false
                }

                if (numberHintNeeded && form.number != null && form.number == targetNumber) {
                    numberHintNeeded = false
                }

                if (genderHintNeeded && form.gender != null && form.gender == targetGender) {
                    genderHintNeeded = false
                }
            }

        })

        let result = ''

        if (tenseHintNeeded) {
            result += (targetTense == Tense.PAST ? 'past' : 'present') 
        }

        if (numberHintNeeded) {
            if (result) {
                result += ', '
            }
            result += (targetNumber == Number.PLURAL ? 'plural' : 'singular') 
        }

        if (genderHintNeeded) {
            if (result) {
                result += ', '
            }

            result += (targetGender == Gender.M ? 'masculine' : (targetGender == Gender.N ? 'neuter' : 'feminine')) 
        }

        return result         
    }
}

function isStudiedWord(word: Word, fact: Fact) {
    let result = false

    word.visitFacts((f) => {
        if (f.getId() == fact.getId()) {
            result = true
        }
    })

    return result
}

function isWorthExplaining(fact: Fact) {
    return !(fact instanceof InflectionFact &&
        fact.form == fact.inflection.defaultForm)
}

export function wordToStudyWord(word: Word, words: StudyWord[], studiedFact: Fact): StudyWord {
    let facts: UnknownFact[] = []

    let getHint = () => {
        let wordHint

        if ((studiedFact instanceof Word || studiedFact instanceof InflectableWord) && isStudiedWord(word, studiedFact)) {
            wordHint = word.getEnglish()
        }
        else {
            wordHint = (word as InflectedWord).getDefaultInflection().jp 
        }

        return wordHint
    }

    let isGiveaway = (fact: Fact) => {
        if (studiedFact instanceof PhraseCase) {
            return (fact instanceof InflectionFact)
        }
        else { 
            return false
        }
    } 

    let result = {
        id: word.getId(),
        jp: word.jp,
        getHint: getHint,
        getFormHint: () => {
            return getFormHint(word, words, studiedFact) 
        },
        form: (word instanceof InflectedWord ? FORMS[word.form] : null),
        getHintFacts: () => facts.filter((f) => !isGiveaway(f.fact)),
        facts: facts,
        wordFact: word
    }

    word.visitFacts((fact: Fact) => {
        if (isWorthExplaining(fact)) {
            facts.push({ fact: fact, word: result })
        }
    })

    return result
}

interface WordBlock {
    caseStudy: boolean,
    start: number,
    end: number
    words: StudyWord[]
}

function findWordBlocks(wordMatch: Match, phraseMatch: Match, words: StudyWord[]) {
    let result: WordBlock[] = []

    phraseMatch.words.forEach((m) => {

        let block: WordBlock

        let i = m.index

        let isCaseStudy = wordMatch.words.findIndex((n) => i == n.index) < 0

        if (result.length &&
            i == result[result.length-1].end &&
            isCaseStudy == result[result.length-1].caseStudy) {

            block = result[result.length-1]

            block.words.push(words[i])
            block.end = i+1
        }
        else {
            block = {
                start: i,
                end: i+1,
                caseStudy: isCaseStudy,
                words: [ words[i] ]
            }

            result.push(block)
        }

    })

    return result
}

function replaceWordsWithStudyPhrase(phrase: Phrase, words: StudyWord[], wordBlocks: WordBlock[], phraseMatch: Match, wordMatch: Match) {
    let fragments = phraseMatch.pattern.getEnglishFragments()

console.log('english blocks', fragments.map((eb) => eb.en(phraseMatch)))

    let atWordBlock = 0, atFragment = 0
    let wordIndexAdjust = 0

    while (atWordBlock < wordBlocks.length || atFragment < fragments.length) {
        let wordBlock = wordBlocks[atWordBlock]
        let englishBlock = fragments[atFragment]

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
            atFragment++
        }
        else if (!englishBlock ||
            (!wordBlock.caseStudy && englishBlock.placeholder)) {
            // add a Russian text block with English equivalent.
            words.splice(wordBlock.start + wordIndexAdjust, wordBlock.end - wordBlock.start, 
                new StudyPhrase(phrase, '', 
                    words.slice(wordBlock.start, wordBlock.end)))

            wordIndexAdjust += 1 - (wordBlock.end - wordBlock.start)

            atWordBlock++
        }
        else if (wordBlock.caseStudy && englishBlock.placeholder) {
            // case study block: retain Russian words
            wordBlock.words.forEach((word) => {
                word.facts.push({
                    fact: phrase.getCaseFact(word.form.grammaticalCase),
                    word: word 
                })
            })

            atWordBlock++
            atFragment++
        }
        else if (!wordBlock.caseStudy && !englishBlock.placeholder) {
            // add an English text block for Russian text
            words.splice(wordBlock.start + wordIndexAdjust, wordBlock.end - wordBlock.start, 
                new StudyPhrase(phrase, englishBlock.en(phraseMatch), 
                    words.slice(wordBlock.start, wordBlock.end)))

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

export default function toStudyWords(sentence: Sentence, studiedFact: Fact, corpus: Corpus, ignorePhrases?: boolean): StudyWord[] {
    let words: StudyWord[] = []
    
    sentence.words.forEach((word) => words.push(wordToStudyWord(word, words, studiedFact)))

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

console.log('phrase match ' + phraseMatch.words.map((m) => m.word.jp).join(' - '))
console.log('word match ' + wordMatch.words.map((m) => m.word.jp).join(' - '))

        let wordBlocks: WordBlock[] = findWordBlocks(wordMatch, phraseMatch, words)

console.log('word blocks', wordBlocks.map((wb) => wb.words.map((w) => w.jp).join(' ')).join(' - '))

        if (phrase.getId() == studiedFact.getId()) {
            replaceWordsWithStudyPhrase(phrase, words, wordBlocks, phraseMatch, wordMatch)
        }
        else {
            phraseMatch.words.forEach((m) => {
                words[m.index].facts.push({ fact: phrase, word: words[m.index] })

                if (m.wordMatch.isCaseStudy()) {
                    words[m.index].facts.push({ 
                        fact: phrase.getCaseFact(((m.wordMatch as any) as CaseStudyMatch).getCaseStudied()), 
                        word: words[m.index] })
                }
            })
        }
    }

    if (!ignorePhrases) {
        sentence.phrases.forEach((p) => { 
            if (p.getId() != studiedFact.getId()) {
                handlePhrase(p)
            }
        })
    }

    if (studiedFact instanceof Phrase) {
        // needs to be done last since indexes change.
        handlePhrase(studiedFact)
    }

    if (Words.PUNCTUATION.indexOf(words[words.length-1].jp) < 0) {
        let fullStop = corpus.words.get('.')

        if (fullStop) {
            words.push(wordToStudyWord(fullStop, words, studiedFact))
        }
    }

    return words
}
