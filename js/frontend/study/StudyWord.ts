
import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import InflectionFact from '../../shared/inflection/InflectionFact'
import { InflectionForm } from '../../shared/inflection/InflectionForms'
import UnknownFact from './UnknownFact'

interface StudyWord {
    id: string
    jp: string
    getHint(): string
    getExplanation(): string
    form: InflectionForm
    getHintFacts(): UnknownFact[]
    facts: UnknownFact[]
    wordFact: Fact
}

export default StudyWord