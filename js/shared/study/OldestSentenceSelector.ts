
import LastSawSentenceKnowledge from './LastSawSentenceKnowledge'
import { FactSentences } from '../IndexSentencesByFact'
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
const MAX_LOG = Math.log(MAX_AGE_MS + 1)

export default class OldestSentenceSelector {

    constructor(public knowledge: LastSawSentenceKnowledge, public facts: Facts ) {
        this.knowledge = knowledge
        this.facts = facts
    }

    chooseSentence(sentences: FactSentences) {
        let chosenSentence
        let highestScore = -1

        sentences.easy.concat(sentences.ok).concat(sentences.hard).forEach((sentenceDiff) => {

            let lastSawDate = this.knowledge.lastSawSentence[sentenceDiff.sentence.id]

            let age

            if (lastSawDate) {
                age = Math.min(new Date().getTime() - lastSawDate.getTime(), MAX_AGE_MS) / MAX_AGE_MS
            }
            else {
                age = 1
            }

            let score 

            if (age == 1) {
                let difficulty = sentenceDiff.difficulty / this.facts.facts.length

                score = age + 1 - difficulty
            }
            else {
                score = age
            }

            if (score > highestScore) {
                chosenSentence = sentenceDiff.sentence
                highestScore = score
            }

        })

        return chosenSentence
    }

} 