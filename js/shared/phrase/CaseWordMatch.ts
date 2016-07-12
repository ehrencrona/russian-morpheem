
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import { FORMS, GrammaticalCase } from '../inflection/InflectionForms'

export default class CaseWordMatch implements WordMatch {
    constructor(public grammaticalCase : GrammaticalCase, public caseStr: string) {
        this.grammaticalCase = grammaticalCase
        this.caseStr = caseStr
    }

    matches(words: Word[]) {
        for (let i = 0; i < words.length; i++) {
            let word = words[i]

            if (!(word instanceof InflectedWord) || 
                !FORMS[word.form] ||
                FORMS[word.form].grammaticalCase != this.grammaticalCase) {
                return i
            }
        }

        return words.length
    }

    toString() {
        return '@' + this.caseStr
    }
}