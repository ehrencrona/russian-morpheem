
import InflectedWord from '../../shared/InflectedWord'
import { InflectionForm, CASES, FORMS, Tense, Number, Gender } from '../../shared/inflection/InflectionForms'

import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'

import StudyWord from './StudyWord'
import StudyPhrase from './StudyPhrase'

function isStudiedWord(word: Word, fact: Fact) {
    let result = false

    word.visitFacts((f) => {
        if (f.getId() == fact.getId()) {
            result = true
        }
    })

    return result
}

export default function getFormHint(forWord: Word, words: StudyWord[], studiedFact: Fact): string {
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

        if (form.command) {
            if (result) {
                result += ', '
            }

            result += 'imperative' 
        }

        return result         
    }
}
