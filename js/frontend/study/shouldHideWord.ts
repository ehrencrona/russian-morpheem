import Word from '../../shared/Word'
import Fact from '../../shared/fact/Fact'
import StudyFact from '../../shared/study/StudyFact'

export default function shouldHideWord(word: Word, hiddenFacts: StudyFact[]) {
    let wordFacts: Fact[] = []

    word.visitFacts((fact) => wordFacts.push(fact))

    return wordFacts.find((wordFact) => 
        !!hiddenFacts.find((hiddenFact) => hiddenFact.fact.getId() == wordFact.getId()))
}
