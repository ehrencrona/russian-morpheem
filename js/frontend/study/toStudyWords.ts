import InflectionFact from '../../shared/inflection/InflectionFact'
import InflectedWord from '../../shared/InflectedWord'
import { InflectionForm, CASES, FORMS, Tense, Number, Gender } from '../../shared/inflection/InflectionForms'

import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import Words from '../../shared/Words'
import Sentence from '../../shared/Sentence'
import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
import { CaseStudy } from '../../shared/phrase/PhraseMatch'

import UnknownFact from './UnknownFact'
import StudyWord from './StudyWord'
import StudyPhrase from './StudyPhrase'

export function getFormHint(words: StudyWord[], studiedFact: Fact): string {
    let fact = studiedFact

    if (fact instanceof InflectionFact || fact instanceof InflectedWord) {
        let form = FORMS[fact.form]

        if (!form) {
            console.warn(`Unknown form ${ fact.form }.`)
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
                let form = word.form

                if (tenseHintNeeded && form.tense && form.tense == targetTense) {
                    tenseHintNeeded = false
                }

                if (numberHintNeeded && form.number && form.number == targetNumber) {
                    numberHintNeeded = false
                }

                if (genderHintNeeded && form.gender && form.gender == targetGender) {
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


export function wordToStudyWord(word: Word, words: StudyWord[], studiedFact: Fact): StudyWord {
    let facts: UnknownFact[] = []

    let getHint = () => {
        let formHint = getFormHint(words, studiedFact) 
        let wordHint

        if (studiedFact.getId() != word.getId()) {
            wordHint = word.getEnglish()
        }
        else {
            wordHint = (word as InflectedWord).getDefaultInflection().jp 
        }

        return wordHint + 
            (formHint ? ', ' + formHint : '')
    }

    let result = {
        id: word.getId(),
        jp: word.jp,
        getHint: getHint,
        form: (word instanceof InflectedWord ? FORMS[word.form] : null),
        getHintFacts: () => facts,
        facts: facts,
        wordFact: word
    }

    word.visitFacts((fact: Fact) => {
        facts.push({ fact: fact, word: result })
    })

    return result
}



interface Block {
    caseStudy: boolean,
    start: number,
    end: number
}

interface WordBlock extends Block {
    words: StudyWord[]
}

function findWordBlocks(wordIndexes: number[], phraseIndexes: number[], words: StudyWord[]) {
    let result: WordBlock[] = []

    let last = -2

    phraseIndexes.forEach((i) => {

        let block: WordBlock

        let isCaseStudy = wordIndexes.indexOf(i) < 0

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



export default function toStudyWords(sentence: Sentence, studiedFact: Fact, corpus: Corpus): StudyWord[] {
    let words: StudyWord[] = []
    
    sentence.words.forEach((word) => words.push(wordToStudyWord(word, words, studiedFact)))

    sentence.phrases.forEach((phrase) => {
        let phraseIndexes = phrase.match(sentence.words, corpus.facts, CaseStudy.STUDY_BOTH)

        if (!phraseIndexes) {
            console.warn(phrase + ' does not match ' + sentence + '.')
            return
        }

        let wordIndexes = phrase.match(sentence.words, corpus.facts, CaseStudy.STUDY_WORDS)

        let wordBlocks: WordBlock[] = findWordBlocks(wordIndexes, phraseIndexes, words)

        let englishBlocks = phrase.getEnglishBlocks()

        let atWordBlock = 0, atEnglishBlock = 0
        let wordIndexAdjust = 0

        while (atWordBlock < wordBlocks.length || atEnglishBlock < englishBlocks.length) {
            let wordBlock = wordBlocks[atWordBlock]
            let englishBlock = englishBlocks[atEnglishBlock]

            if (!wordBlock ||
                (englishBlock && wordBlock.caseStudy && !englishBlock.placeholder)) {
                let start
                
                if (wordBlock) {
                    start = wordBlock.start 
                }
                else {
                    start = wordBlocks[wordBlocks.length-1].end
                }

                words.splice(start + wordIndexAdjust, 0, new StudyPhrase(phrase, englishBlock.en, []))
                wordIndexAdjust++

                atEnglishBlock++
            }
            else if (!englishBlock ||
                (!wordBlock.caseStudy && englishBlock.placeholder)) {
                words.splice(wordBlock.start + wordIndexAdjust, wordBlock.end - wordBlock.start, 
                    new StudyPhrase(phrase, '', 
                        words.slice(wordBlock.start, wordBlock.end)))

                wordIndexAdjust += 1 - (wordBlock.end - wordBlock.start)

                atWordBlock++
            }
            else if (wordBlock.caseStudy && englishBlock.placeholder) {
                atWordBlock++
                atEnglishBlock++
            }
            else if (!wordBlock.caseStudy && !englishBlock.placeholder) {
                words.splice(wordBlock.start + wordIndexAdjust, wordBlock.end - wordBlock.start, 
                    new StudyPhrase(phrase, englishBlock.en, 
                        words.slice(wordBlock.start, wordBlock.end)))

                wordIndexAdjust += 1 - (wordBlock.end - wordBlock.start)

                atEnglishBlock++
                atWordBlock++
            }
            else {
                console.error('Unexpected case.')
                break
            }
        }
    })

    if (Words.PUNCTUATION.indexOf(words[words.length-1].jp) < 0) {
        let fullStop = corpus.words.get('.')

        if (fullStop) {
            words.push(wordToStudyWord(fullStop, words, studiedFact))
        }
    }

    return words
}
