import StudyWord from './StudyWord'
import { InflectionForm } from '../../shared/inflection/InflectionForms'
import Fact from '../../shared/fact/Fact'
import Phrase from '../../shared/phrase/Phrase'
import StudyFact from './StudyFact'

export default class StudyPhrase implements StudyWord {
    id: string
    jp: string
    form: InflectionForm
    wordFact: Fact
    facts: StudyFact[]

    constructor(public phrase: Phrase, public en: string, public words: StudyWord[]) {
        this.phrase = phrase
        this.words = words

        this.id = phrase.getId()

        this.jp = words.map((w) => w.jp).join(' ')
        this.en = en
        this.wordFact = phrase

        this.facts = [ { fact: phrase, words: words } ] 

        words.forEach((w) => this.facts = this.facts.concat(w.facts))
    }

    isPartOfPhrase(phrase: Phrase) {
        return this.id == phrase.id
    }

    hasFact(fact: Fact) {
        let id = fact.getId()

        return !!this.facts.find(fact => fact.fact.getId() == id)
    }

    getFormHint() {
        return ''
    }
    
    getHint() {
        return this.en
    }

}
