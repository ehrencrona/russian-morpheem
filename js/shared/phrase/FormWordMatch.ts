
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import { FORMS, InflectionForm } from '../inflection/InflectionForms'

export default class FormWordMatch implements WordMatch {
    constructor(public form : InflectionForm, public formStr: string) {
        this.form = form
        this.formStr = formStr
    }

    matches(words: Word[], wordPosition: number): number {
        let form = this.form

        for (let i = wordPosition; i < words.length; i++) {
            let word = words[i]

            if (word instanceof InflectedWord) {
                let wordForm = FORMS[word.form]

                if (!wordForm ||
                    (form.grammaticalCase && form.grammaticalCase != wordForm.grammaticalCase) ||
                    (form.gender && form.gender != wordForm.gender) ||
                    (form.number && form.number != wordForm.number) ||
                    (form.tense && form.tense != wordForm.tense)) {
                    return i - wordPosition
                }
            }
            else {
                return i - wordPosition
            }                
        }

        return words.length - wordPosition
    }

    toString() {
        return this.formStr
    }
}