import Fact from './fact/Fact'
import { FORMS } from './inflection/InflectionForms'
import WORD_FORMS from './inflection/WordForms'

export default class Grammars {
    grammarById : { [s: string]: Fact } = {}

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

        for (let formId in WORD_FORMS) {
            let inflectionForm = WORD_FORMS[formId]

            this.grammarById[formId] = inflectionForm
        }
    }

    get(id): Fact {
        return this.grammarById[id];
    }
}
