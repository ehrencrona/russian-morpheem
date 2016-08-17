
import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'
import InflectionFact from '../../shared/inflection/InflectionFact'
import { InflectionForm } from '../../shared/inflection/InflectionForms'
import StudyFact from './StudyFact'

interface StudyWord {
    id: string
    jp: string
    getHint(): string
    getFormHint(): string
    form: InflectionForm
    facts: StudyFact[]
    hasFact(fact: Fact): boolean
    isPartOfPhrase(phrase: Phrase): boolean
    wordFact: Fact
}

export default StudyWord