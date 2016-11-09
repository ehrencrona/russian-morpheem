
import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'
import InflectionFact from '../../shared/inflection/InflectionFact'
import { FORMS, InflectionForm } from '../../shared/inflection/InflectionForms'
import Phrase from '../../shared/phrase/Phrase'
import AnyWord from '../../shared/AnyWord'

export default function doesFactMatchQuery(fact: Fact, filter: string): number {
    filter = filter.toLowerCase()

    let result = 0

    let matches = (string: string, weight?: number): void => {
        let i = string.toLowerCase().indexOf(filter) 

        let matchResult = 0

        if (i < 0) {
            return
        }

        if (i == 0) {
            // matches full string
            if (string.length == filter.length) {
                matchResult = 8
            }
            // matches first word
            else if (string[i + filter.length] == ' ') {
                matchResult = 7
            }
            // matches beginning of string
            else {
                matchResult = 5
            }
        }
        else {
            if (string[i-1] == ' ') {
                // matches complete word
                if (i + filter.length == string.length 
                    || string[i + filter.length] == ' ') {
                    matchResult = 6
                }
                // matches beginning of a word
                else {
                    matchResult = 4
                }
            }
            else {
                // matches end of word
                if (i + filter.length == string.length 
                    || string[i + filter.length] == ' ') {
                    matchResult = 3
                }
                else {
                    matchResult = 2
                }
            }
        }

        result = Math.max(result, matchResult * (weight || 10))
    }

    matches(fact.getId())

    let matchesAnyTranslation = (en: {}) => {
        for (let key in en) {
            matches(en[key])
        }
    }

    if (fact instanceof Word) {
        matches(fact.jp)
        matchesAnyTranslation(fact.en)
    }
    else if (fact instanceof InflectableWord) {
        matches(fact.getDefaultInflection().jp)
        matchesAnyTranslation(fact.en)
    }
    else if (fact instanceof InflectionFact) {
        matches(fact.inflection.endings[fact.form].suffix)
        matches(FORMS[fact.form].name, 5)
    }
    else if (fact instanceof InflectionForm) {
        matches(fact.name)
    }
    else if (fact instanceof Phrase) {
        matches(fact.description, 6)
        matches(fact.en, 6)
    }

    return result
}