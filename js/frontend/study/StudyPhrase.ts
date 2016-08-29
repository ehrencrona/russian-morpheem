import { InflectionForm } from '../../shared/inflection/InflectionForms'
import Fact from '../../shared/fact/Fact'
import Phrase from '../../shared/phrase/Phrase'

import StudyToken from './StudyToken'
import StudyWord from './StudyWord'
import StudyFact from './StudyFact'

export default class StudyPhrase implements StudyToken {
    jp: string
    facts: StudyFact[] = []

    constructor(public phrase: Phrase, public en: string, public words: StudyWord[], public studied: boolean) {
        this.phrase = phrase
        this.words = words
        this.studied = studied

        this.jp = words.map((w) => w.jp).join(' ')
        this.en = en

        let factSet: Set<string> = new Set()

        this.facts.push({ fact: phrase, words: words })
        factSet.add(phrase.getId())

        words.forEach(w => {
            this.facts.forEach(f => {
                if (!factSet.has(f.fact.getId())) {
                    factSet.add(f.fact.getId())
                    this.facts.push(f)
                }
            })
        })
    }
    
    getHint() {
        return this.en
    }

}
