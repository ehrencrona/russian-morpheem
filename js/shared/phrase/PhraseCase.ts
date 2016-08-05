
import Fact from '../fact/Fact'
import { GrammaticalCase, CASES } from '../../shared/inflection/InflectionForms'
import Phrase from './Phrase'
import EnglishPatternFragment from './EnglishPatternFragment'

export default class PhraseCase implements Fact {
    placeholderName: string

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