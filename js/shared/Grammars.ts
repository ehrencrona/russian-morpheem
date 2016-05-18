import Grammar from './Grammar';

export default class Grammars {
    grammarById : { [s: string]: Grammar } = {}

    constructor(inflections) {
        this.grammarById = {};
        for (let inflection of inflections.inflections) {
            inflection.visitFacts((fact) => {
                this.grammarById[fact.getId()] = fact;
            });
        }
    }

    get(id) {
        return this.grammarById[id];
    }
}
