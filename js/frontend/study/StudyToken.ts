import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import Phrase from '../../shared/phrase/Phrase'
import StudyFact from './StudyFact'

interface StudyToken {
    facts: StudyFact[]
    jp: string
    studied: boolean
    getHint(): string
}

export default StudyToken