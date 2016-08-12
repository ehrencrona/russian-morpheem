
import WordMatch from './WordMatch'
import CaseStudyMatch from './CaseStudyMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import { FORMS, InflectionForm } from '../inflection/InflectionForms'
import { EXACT_MATCH_QUANTIFIER, ANY_MATCH_QUANTIFIER, AT_LEAST_ONE_QUANTIFIER } from './AbstractQuantifierMatch'
import AbstractQuantifierMatch from './AbstractQuantifierMatch'

export const POS_NAMES = {
    noun: 'n',
    adjective: 'adj',
    verb: 'v',
    numeral: 'num',
    pronoun: 'pron',
    adverb: 'adv'
}

export default class PosFormWordMatch extends AbstractQuantifierMatch implements CaseStudyMatch, WordMatch {
    posName: string 

    constructor(public pos: string, public form : InflectionForm, public formStr: string, quantifier?: string) {
        super((!quantifier && pos ? AT_LEAST_ONE_QUANTIFIER : quantifier))

        this.form = form
        this.formStr = formStr

        this.pos = pos
        this.posName = POS_NAMES[pos]
    }

    wordMatches(word: Word) {
        if (this.posName &&
            word.pos != this.posName) {
            return false
        }

        if (word instanceof Word && !this.form) { 
            return true
        }
        else if (word instanceof InflectedWord) {
            let form = this.form

            if (form) {
                let wordForm = FORMS[word.form]

                return wordForm && form.matches(wordForm) 
            }
            else {
                return true
            }
        }
    }

    setCorpus() {
    }

    isCaseStudy() {
        return !!(this.form && this.form.grammaticalCase)
    }

    getCaseStudied() {
        return this.form.grammaticalCase
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
            (this.quantifier == (this.pos ? AT_LEAST_ONE_QUANTIFIER : EXACT_MATCH_QUANTIFIER) ? '' : this.quantifier)
    }
}