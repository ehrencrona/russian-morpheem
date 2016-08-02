
import { Exposure, Skill, Knowledge } from '../../shared/study/Exposure'
import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import StudyWord from './StudyWord'

interface StudyFact {
    fact: Fact,
    words: StudyWord[]
}

export default StudyFact