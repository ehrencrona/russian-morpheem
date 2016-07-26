
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

    wordMatches(word: Word) {
        if (word instanceof InflectedWord) {
            if (this.posName &&
                word.word.inflection.pos != this.posName) {
                return false
            }

            let form = this.form

            if (form) {
                let wordForm = FORMS[word.form]

                let res = !(!wordForm ||
                    (form.grammaticalCase != null && form.grammaticalCase != wordForm.grammaticalCase) ||
                    (form.gender != null && form.gender != wordForm.gender) ||
                    (form.number != null && form.number != wordForm.number) ||
                    (form.adjectiveForm != null && form.adjectiveForm != wordForm.adjectiveForm) ||
                    (form.comparison != null && form.comparison != wordForm.comparison) ||
                    (form.pos != null && form.pos != wordForm.pos) ||
                    (form.tense != null && form.tense != wordForm.tense))

                return res
            }
            else {
                return true
            }
        }
    }

    isCaseStudy() {
        return !!(this.form && (this.form.grammaticalCase || this.form.comparison))
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