
import WordMatch from './WordMatch'
import CaseStudyMatch from './CaseStudyMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import { FORMS, InflectionForm } from '../inflection/InflectionForms'
import { EXACT_MATCH_QUANTIFIER, ANY_MATCH_QUANTIFIER, AT_LEAST_ONE_QUANTIFIER } from './AbstractQuantifierMatch'
import AbstractFormMatch from './AbstractFormMatch'
import MatchContext from './MatchContext'

export const POS_NAMES = {
    noun: 'n',
    adjective: 'adj',
    verb: 'v',
    numeral: 'num',
    pronoun: 'pron',
    adverb: 'adv',
    particle: 'part',
    preposition: 'prep'
}

function getDefaultQuantifier(pos: string) {
    return pos ? AT_LEAST_ONE_QUANTIFIER : EXACT_MATCH_QUANTIFIER
}

export default class PosFormWordMatch extends AbstractFormMatch implements CaseStudyMatch, WordMatch {
    posName: string 

    constructor(public pos: string, form : InflectionForm, public formStr: string, quantifier?: string) {
        super(form, quantifier || getDefaultQuantifier(pos))

        this.formStr = formStr

        this.pos = pos
        this.posName = POS_NAMES[pos]
    }

    wordMatches(word: Word, context: MatchContext) {
        if (this.posName &&
            word.pos != this.posName) {

            // possessives are pronouns but can for most purposes be treated as adjectives
            if (this.posName == 'adj' && context.facts.hasTag(word, 'possessive')) {
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
        if (this.form && !this.pos && this.quantifier == getDefaultQuantifier(this.pos) && !POS_NAMES[this.formStr]) {
            return this.formStr
        }

        if (this.pos && !this.form && this.quantifier == getDefaultQuantifier(this.pos) && !FORMS[this.pos]) {
            return this.pos
        }

        return (this.pos ? this.pos : '') + '@' + 
            (this.formStr ? this.formStr : '') + 
            (this.quantifier != getDefaultQuantifier(this.pos) ? this.quantifier : '')
    }
}