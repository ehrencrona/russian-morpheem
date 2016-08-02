
import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
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
    wordFact: Fact
}

export default StudyWord