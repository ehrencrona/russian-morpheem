
import LastSawSentenceKnowledge from './LastSawSentenceKnowledge'
import SentenceScore from './SentenceScore'
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000

export default class OldestSentenceSelector {

    constructor(public knowledge: LastSawSentenceKnowledge, public facts: Facts ) {
        this.knowledge = knowledge
        this.facts = facts
    }

    scoreSentences(sentenceScores: SentenceScore[]): SentenceScore[] {
        let chosenSentence
        let highestScore = -1

        sentenceScores.forEach((sentenceScore) => {
            let lastSawDate = this.knowledge.lastSawSentence[sentenceScore.sentence.id]

            let age

            if (lastSawDate) {
                age = Math.min(new Date().getTime() - lastSawDate.getTime(), MAX_AGE_MS) / MAX_AGE_MS
            }
            else {
                age = 1
            }

            sentenceScore.score = age * sentenceScore.score

            sentenceScore.debug['age'] = age
            sentenceScore.debug['lastSawSentence'] = lastSawDate
            sentenceScore.debug['lastSawSentenceId'] = sentenceScore.sentence.id
        })

        return sentenceScores
    }

} 