
import Phrase from '../../phrase/Phrase'
import { CASES } from '../../inflection/InflectionForms'

export default function getPhraseSeoText(phrase: Phrase) {
    let words = phrase.getWords()
    let cases = phrase.getCases()

    if (words.length && cases.length) {
        return words.map(w => w.toText()).join(' and ') 
            + ' with the '
            + cases.map(c => CASES[c]).join(' and ') 
    }
    else {
        return ''
    }
}
