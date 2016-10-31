
import Fact from '../fact/Fact'
import AbstractFact from '../fact/AbstractFact'

import { GrammaticalCase, CASES } from '../../shared/inflection/InflectionForms'
import Phrase from './Phrase'

import EnglishPatternFragment from './EnglishPatternFragment'

export default class PhraseCase extends AbstractFact {
    placeholderName: string

    constructor(public phrase: Phrase, public grammaticalCase: GrammaticalCase) {
        super(CASES[grammaticalCase] + '@' + phrase.id)

        this.phrase = phrase
        this.grammaticalCase = grammaticalCase
    }
}