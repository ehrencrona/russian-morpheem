
import Fact from '../fact/Fact'
import { GrammaticalCase, CASES } from '../../shared/inflection/InflectionForms'
import Phrase from './Phrase'

export default class PhraseCase implements Fact {
    constructor(public phrase: Phrase, public grammaticalCase: GrammaticalCase) {
        this.phrase = phrase
        this.grammaticalCase = grammaticalCase
    }

    getId() {
        return CASES[this.grammaticalCase] + '@' + this.phrase.id
    }

    visitFacts(visitor) {
        visitor(this)
    }
}