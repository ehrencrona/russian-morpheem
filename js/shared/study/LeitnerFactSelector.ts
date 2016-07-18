
import LeitnerKnowledge from './LeitnerKnowledge'
import Fact from '../fact/Fact'
import FactScore from './FactScore'

const MAX_PARALLEL_STUDY_COUNT = 20
const NEW_FACT_RATE = 0.1

export default class LeitnerFactSelector {

    constructor(public knowledge: LeitnerKnowledge, public facts: Fact[] ) {
        this.knowledge = knowledge
        this.facts = facts
    }

    chooseFact(): FactScore[] {
        let factScores: FactScore[] = []

        let deckCount = this.knowledge.decks.length

        // each item in first deck studied three times as often as last
        let deckScore = (deckIndex) => 
            ((deckCount - deckIndex) / deckCount * 2 + 1) * this.knowledge.decks[deckIndex].facts.length

        this.knowledge.decks.forEach((deck, index) => {
            let score = deckScore(index) / deck.facts.length

            deck.facts.forEach((fact) => {
                factScores.push({ fact: fact, score: score })
            })
        })

        let chanceOfNewFact = (1 + NEW_FACT_RATE) * Math.max(MAX_PARALLEL_STUDY_COUNT - this.knowledge.size, 1)

        let newFacts: Fact[] = []

        for (let i = 0; i < this.facts.length; i++) {
            let fact = this.facts[i]

            if (!this.knowledge.isKnown(fact) && !this.knowledge.isStudying(fact)) {
                newFacts.push(fact)

                if (newFacts.length == 4) {
                    break
                }
            }
        }

        newFacts.forEach((fact) => 
            factScores.push({ fact: fact, score: chanceOfNewFact / newFacts.length })
        )

        return this.sample(factScores, 10)
    }

    sample(factScores: FactScore[], count: number) {
        let scoreSum = 0

        function sampleOne(): FactScore {
            let score = Math.random() * scoreSum

            return factScores.find((fs) => {
                score -= fs.score

                return score <= 0
            })
        }
        
        factScores.forEach((fs) => scoreSum += fs.score)

        if (isNaN(scoreSum)) {
            console.warn('Fact scores:', factScores)
            throw new Error('Fact score was NaN.')
        }

        let result: FactScore[] = []

        for (let i = 0; i < count; i++) {
            result.push(sampleOne())
        }

        return result
    }
} 