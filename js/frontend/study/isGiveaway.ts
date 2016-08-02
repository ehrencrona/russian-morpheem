
import StudyWord from './StudyWord'
import Fact from '../../shared/fact/Fact'
import StudyFact from './StudyFact'
import Phrase from '../../shared/phrase/Phrase'

export default function isGiveaway(fact: StudyFact, hiddenFacts: StudyFact[]) {

    if (!!hiddenFacts.find((hiddenFact) => fact.fact.getId() == hiddenFact.fact.getId())) {
        return true
    }


    // if this fact is somehow part of phrase words, it's always a giveaway
    if (hiddenFacts.find((f) => f instanceof Phrase && !!f.words.find((word) => fact.words.indexOf(word) >= 0))) {
        return true
    }

    return false
} 
