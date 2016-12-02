
import { Exposure, Knowledge } from '../study/Exposure'

import NaiveKnowledge from './NaiveKnowledge'
import SentenceScore from './SentenceScore'
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import Sentence from '../Sentence'

const STOP_COUNTING_AT = 10
const SCORE_BY_MAYBES = [ 1 ]
const SCORE_BY_UNKNOWNS = [ 1 ]
const DECAY_UNKNOWN = 0.5
const DECAY_MAYBE = 0.75

export default class KnowledgeSentenceSelector {

    constructor(public knowledge: NaiveKnowledge) {
        this.knowledge = knowledge
    }

    calculateScoreForSentence(sentenceScore: SentenceScore) {
        let maybes = 0
        let unknowns = 0

        if (!sentenceScore.debug) {
            sentenceScore.debug = {}
        }

        sentenceScore.debug['maybeUnknowns'] = []
        sentenceScore.debug['unknowns'] = []

        sentenceScore.sentence.visitFacts((fact) => {

            let knowledgeOfFact = this.knowledge.getKnowledge(fact)

            if (knowledgeOfFact == Knowledge.MAYBE) {
                maybes++        

                sentenceScore.debug['maybeUnknowns'].push(fact.getId())
            }
            else if (knowledgeOfFact == Knowledge.DIDNT_KNOW) {
                unknowns++

                sentenceScore.debug['unknowns'].push(fact.getId())
            }

        })

        return SCORE_BY_MAYBES[Math.min(maybes, STOP_COUNTING_AT)] * 
                SCORE_BY_UNKNOWNS[Math.min(unknowns, STOP_COUNTING_AT)]
    }

    scoreSentences<S extends SentenceScore>(sentenceScores: S[]): S[] {
        if (this.knowledge.isEmpty()) {
            return sentenceScores
        }

        let chosenSentence
        let highestScore = -1

        sentenceScores.forEach((sentenceScore) => {

            sentenceScore.score = sentenceScore.score * this.calculateScoreForSentence(sentenceScore)

        })

        return sentenceScores
    }

} 

for (let i = 1; i <= STOP_COUNTING_AT; i++) {
    SCORE_BY_MAYBES[i] = DECAY_MAYBE * SCORE_BY_MAYBES[i-1]
    SCORE_BY_UNKNOWNS[i] = DECAY_UNKNOWN * SCORE_BY_UNKNOWNS[i-1]
}