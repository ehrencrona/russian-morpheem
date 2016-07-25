import StudyWord from './StudyWord'
import { InflectionForm } from '../../shared/inflection/InflectionForms'
import Fact from '../../shared/fact/Fact'
import Phrase from '../../shared/phrase/Phrase'
import UnknownFact from './UnknownFact'

export default class StudyPhrase implements StudyWord {
    id: string
    jp: string
    form: InflectionForm
    wordFact: Fact
    facts: UnknownFact[]

    constructor(public phrase: Phrase, public en: string, public words: StudyWord[]) {
        this.phrase = phrase
        this.words = words

        this.id = phrase.getId()
        this.jp = words.map((w) => w.jp).join(' ')
        this.en = en
        this.wordFact = phrase

        this.facts = [ { fact: phrase, word: words[0] } ] 
        words.forEach((w) => this.facts = this.facts.concat(w.facts))
    }

    getHint() {
        return this.en
    }

    getHintFacts() {
        return []
    }
    
}
