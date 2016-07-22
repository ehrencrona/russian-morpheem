
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import { FORMS, InflectionForm } from '../inflection/InflectionForms'
import { EXACT_MATCH_QUANTIFIER, ANY_MATCH_QUANTIFIER } from './AbstractQuantifierMatch'
import AbstractQuantifierMatch from './AbstractQuantifierMatch'

export const POS_NAMES = {
    noun: 'n',
    adjective: 'adj',
    verb: 'v',
    numeral: 'num',
    pronoun: 'pron'
}

export default class PosFormWordMatch extends AbstractQuantifierMatch {
    posName: string 

    constructor(public pos: string, public form : InflectionForm, public formStr: string, quantifier?: string) {
        super((!quantifier && !pos ? ANY_MATCH_QUANTIFIER : quantifier))

        this.form = form
        this.formStr = formStr

        this.pos = pos
        this.posName = POS_NAMES[pos]
    }

    allowEmptyMatch() {
        return !!this.pos
    }

    wordMatches(word: Word) {
        if (word instanceof InflectedWord) {
            if (this.posName &&
                word.word.inflection.pos != this.posName) {
console.log('wrong pos' + this.pos + word.word.inflection.pos)
                return false
            }

            let form = this.form

            if (form) {
                let wordForm = FORMS[word.form]

                let res = !(!wordForm ||
                    (form.grammaticalCase && form.grammaticalCase != wordForm.grammaticalCase) ||
                    (form.gender && form.gender != wordForm.gender) ||
                    (form.number && form.number != wordForm.number) ||
                    (form.adjectiveForm && form.adjectiveForm != wordForm.adjectiveForm) ||
                    (form.comparison && form.comparison != wordForm.comparison) ||
                    (form.tense && form.tense != wordForm.tense))

if (!res) {
    console.log('wrong form'+word.form)
}

                return res
            }
            else {
                return true
            }
        }
    }

    toString() {
        if (this.pos && !this.form && this.quantifier == EXACT_MATCH_QUANTIFIER) {
            return this.pos
        }

        if (this.form && !this.pos && this.quantifier == ANY_MATCH_QUANTIFIER) {
            return this.formStr
        }

        return (this.pos ? this.pos : '') + '@' + 
            (this.formStr ? this.formStr : '') + 
            (this.quantifier == EXACT_MATCH_QUANTIFIER ? '' : this.quantifier)
    }
}