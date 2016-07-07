
import { Exposure, Skill, Knowledge } from '../../shared/study/Exposure'
import Fact from '../../shared/fact/Fact'
import UnstudiedWord from '../../shared/UnstudiedWord'

interface UnknownFact {
    fact: Fact,
    word: UnstudiedWord
}

export default UnknownFact