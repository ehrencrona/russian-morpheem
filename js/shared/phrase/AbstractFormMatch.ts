
import { InflectionForm } from '../inflection/InflectionForms'
import AbstractQuantifierMatch from './AbstractQuantifierMatch'
import MatchContext from './MatchContext'

abstract class AbstractFormMatch extends AbstractQuantifierMatch {
    constructor(public form: InflectionForm, quantifier?: string) {
        super(quantifier)

        this.form = form
    }

    matchesForm(wordForm: InflectionForm, context: MatchContext): boolean {
        let form = this.form

        if (form) {
            if (context.overrideFormCase) {
                form = new InflectionForm('foo', 'foo', form)

                form.grammaticalCase = context.overrideFormCase
            }

            return form.matches(wordForm)
        }
        else {
            return true
        }
    }
}

export default AbstractFormMatch