
import LeitnerKnowledge from './LeitnerKnowledge'
import Fact from '../fact/Fact'

const MAX_PARALLEL_STUDY_COUNT = 20
const NEW_FACT_RATE = 0.1

export default class LeitnerFactSelector {

    constructor(public knowledge: LeitnerKnowledge, public facts: Fact[] ) {
        this.knowledge = knowledge
        this.facts = facts
    }


    chooseFact() {

        let deckCount = this.knowledge.decks.length

        let maxScore = 0

        // each item in first deck studied three times as often as last
        let deckScore = (deckIndex) => 
            ((deckCount - deckIndex) / deckCount * 2 + 1) * this.knowledge.decks[deckIndex].facts.length

        this.knowledge.decks.forEach((deck, index) => {
console.log(index+ ': '+ deckScore(index))            
            maxScore += deckScore(index)  
        })

        let chanceOfNewFact = (1 + NEW_FACT_RATE) * Math.max(MAX_PARALLEL_STUDY_COUNT - this.knowledge.size, 1)
        
        maxScore *= chanceOfNewFact 

        let score = Math.random() * maxScore
console.log('score ' + score + ' / ' + maxScore)
        let deck = this.knowledge.decks.find((deck, index) => {
            score -= deckScore(index)

            return score < 0
        })
console.log('deck ' + this.knowledge.decks.findIndex((d) => d==deck) + ', score left ' + score)

        if (deck) {
            return deck.facts[Math.floor(deck.facts.length * Math.random())]
        }
        else {
            return this.getNewFact()
        }

    }

    getNewFact(): Fact {

        return this.facts.find((fact) => !this.knowledge.isKnown(fact) && !this.knowledge.isStudying(fact))

    }

} 