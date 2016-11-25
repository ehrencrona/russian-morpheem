
import { GrammarCase } from '../inflection/Dimensions'
import InflectionForm from '../inflection/InflectionForm'
import { NamedWordForm, WordForm } from '../inflection/WordForm'
import { PartOfSpeech as PoS } from '../inflection/Dimensions'
import AbstractQuantifierMatch from './AbstractQuantifierMatch'
import MatchContext from './MatchContext'

abstract class AbstractFormMatch extends AbstractQuantifierMatch {
    constructor(public wordForms: NamedWordForm[], public inflectionForm: InflectionForm, quantifier?: string) {
        super(quantifier)
    }

    matchesInflectionForm(wordForm: InflectionForm, context: MatchContext): boolean {
        let form = this.inflectionForm

        if (form) {
            if (form.grammaticalCase == GrammarCase.CONTEXT) {
                if (!context.overrideFormCase) {
                    return true
                }

                let id = 'contextCase' + context.overrideFormCase
                form = new InflectionForm(id, id, form)

                form.grammaticalCase = context.overrideFormCase
            }

            return form.matches(wordForm)
        }
        else {
            return true
        }
    }

    matchesWordForm(wordForm: WordForm, context: MatchContext): boolean {
        for (let matchForm of this.wordForms) {
            if (!wordForm.matches(matchForm)) {
                // possessives are pronouns but can for most purposes be treated as adjectives
                if (matchForm.pos == PoS.ADJECTIVE && wordForm.pos == PoS.POSSESSIVE) {
                    continue
                }

                return false
            }
        }

        return true
    }

    isCaseStudy() {
        return !!(this.inflectionForm && this.inflectionForm.grammaticalCase)
    }

    getCaseStudied() {
        return this.inflectionForm.grammaticalCase
    }

    getFormString() {
        let result = this.wordForms.map(f => f.id).join(',')

        if (this.inflectionForm) {
            result += '@' + this.inflectionForm.id
        }

        return result
    }
}

export default AbstractFormMatch