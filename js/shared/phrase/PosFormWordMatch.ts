
import WordMatch from './WordMatch'
import CaseStudyMatch from './CaseStudyMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import { FORMS } from '../inflection/InflectionForms'
import { POS_BY_NAME, POS_NAMES } from './PhrasePattern'

import { PartOfSpeech } from '../inflection/Dimensions'
import InflectionForm from '../inflection/InflectionForm'
import { EXACT_MATCH_QUANTIFIER, ANY_MATCH_QUANTIFIER, AT_LEAST_ONE_QUANTIFIER } from './AbstractQuantifierMatch'
import AbstractFormMatch from './AbstractFormMatch'
import MatchContext from './MatchContext'

function getDefaultQuantifier(pos: PartOfSpeech) {
    return pos ? AT_LEAST_ONE_QUANTIFIER : EXACT_MATCH_QUANTIFIER
}

export default class PosFormWordMatch extends AbstractFormMatch implements CaseStudyMatch, WordMatch {
    constructor(public pos: PartOfSpeech, form : InflectionForm, public formStr: string, quantifier?: string) {
        super(form, quantifier || getDefaultQuantifier(pos))
    }

    wordMatches(word: Word, context: MatchContext) {
        if (this.pos && word.wordForm.pos != this.pos) {

            // possessives are pronouns but can for most purposes be treated as adjectives
            if (this.pos == PartOfSpeech.ADJECTIVE && context.facts.hasTag(word, 'possessive')) {
                if (word instanceof InflectedWord) {
                    let wordForm = FORMS[word.form]

                    return wordForm && this.matchesForm(wordForm, context) 
                }
                else {
                    return true
                }
            }

            return false
        }

        if (word instanceof Word && !this.form) { 
            return true
        }
        else if (word instanceof InflectedWord) {
            let wordForm = FORMS[word.form]

            return wordForm && this.matchesForm(wordForm, context) 
        }
    }

    getForm() {
        return this.form
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
        if (this.form && !this.pos && this.quantifier == getDefaultQuantifier(this.pos) && !POS_BY_NAME[this.formStr]) {
            return this.formStr
        }

        if (this.pos && !this.form && this.quantifier == getDefaultQuantifier(this.pos) && !FORMS[POS_NAMES[this.pos]]) {
            return POS_NAMES[this.pos]
        }

        return (this.pos ? POS_NAMES[this.pos] : '') + '@' + 
            (this.formStr ? this.formStr : '') + 
            (this.quantifier != getDefaultQuantifier(this.pos) ? this.quantifier : '')
    }
}