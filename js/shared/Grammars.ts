import Grammar from './Grammar'
import { FORMS } from './inflection/InflectionForms'

export default class Grammars {
    grammarById : { [s: string]: Grammar } = {}

    constructor(inflections) {
        this.grammarById = {};

        for (let inflection of inflections.inflections) {
            inflection.visitFacts((fact) => {
                this.grammarById[fact.getId()] = fact;
            });
        }

        for (let formId in FORMS) {
            let inflectionForm = FORMS[formId]

            this.grammarById[formId] = inflectionForm
        }
    }

    get(id): Grammar {
        return this.grammarById[id];
    }
}
