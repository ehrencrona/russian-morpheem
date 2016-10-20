
import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import InflectedWord from '../../shared/InflectedWord'

import { InflectionForm, FORMS } from '../../shared/inflection/InflectionForms'

import StudyToken from './StudyToken'
import StudyFact from './StudyFact'

class StudyWord implements StudyToken {
    facts: StudyFact[] = []
    factSet: Set<string> = new Set()
    jp: string
    form: InflectionForm

    // translation override to use the right tranlsation when there are several 
    en: string

    constructor(public word: Word, public studied: boolean) {        
        word.visitFacts((fact: Fact) => this.addFact({ fact: fact, words: [ this ] }))

        this.word = word
        this.jp = word.toString()
        this.studied = studied

        if (word instanceof InflectedWord) {
            this.form = FORMS[word.form]
        }
    }

    addFact(fact: StudyFact) {
        this.factSet.add(fact.fact.getId())
        this.facts.push(fact)
    }

    getHint() {
        return this.en || this.word.getEnglish()
    }

    hasFact(fact: Fact): boolean {
        return this.factSet.has(fact.getId())
    }
}

export default StudyWord