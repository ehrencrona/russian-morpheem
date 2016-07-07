
import Corpus from '../Corpus'
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import { Exposure, Knowledge } from '../study/Exposure'

export const DECK_COUNT = 7

interface Deck {

    index: number,
    facts: Fact[]

    next: Deck,
    previous: Deck

}

export class LeitnerKnowledge {
    known: Set<string> = new Set()

    decks: Deck[] = []
    deckByFact: { [factId: string]: Deck } = {}
    size: number = 0
    factFilter: (fact: Fact) => boolean = (fact) => true

    constructor(public facts: Facts) {
        this.facts = facts

        for (let i = 0; i < DECK_COUNT; i++) {
            this.decks.push({
                index: i,
                facts: [],
                previous: this.decks[i-1],
                next: null
            })

            if (i > 0) {
                this.decks[i-1].next = this.decks[i]
            }
        }
    }


    processExposures(exposures: Exposure[]) {

        exposures.forEach((exposure) => {

            let oldDeck = this.deckByFact[exposure.fact]

            if (exposure.knew == Knowledge.MAYBE) {
                return
            }

            let fact = this.facts.get(exposure.fact)

            if (!this.factFilter(fact)) {
                return
            }

            if (!fact) {
                console.warn(`Unknown fact ${exposure.fact}.`)
                return
            }

            if (!oldDeck) {
                if (exposure.knew == Knowledge.DIDNT_KNOW) {
                    let wasKnown = this.known.has(exposure.fact)

                    if (wasKnown) {
                        this.known.delete(exposure.fact)
                    }

                    let deck = (wasKnown ? this.decks[DECK_COUNT-1] : this.decks[0])

                    deck.facts.push(fact)
                    this.deckByFact[exposure.fact] = deck
                    this.size++
                }
                else {
                    this.known.add(exposure.fact)
                }
            }
            else {
                let newDeck: Deck 

                if (exposure.knew == Knowledge.DIDNT_KNOW) {
                    newDeck = oldDeck.previous
                    if (!newDeck) {
                        return
                    }
                }
                else {
                    newDeck = oldDeck.next
                }

                let oldIndex = oldDeck.facts.findIndex((otherFact) => otherFact.getId() == exposure.fact)

                if (oldIndex >= 0) {
                    oldDeck.facts.splice(oldIndex, 1)
                    this.size--
                }
                else {
                    console.error('Could not find fact in old deck.')
                }

                if (newDeck) {
                    newDeck.facts.push(fact)
                    this.size++
                }
                else {
                    this.known.add(exposure.fact)
                }

                this.deckByFact[fact.getId()] = newDeck
            }

        })

    }

    isKnown(fact: Fact) {
        return this.known.has(fact.getId())
    }

    isStudying(fact: Fact) {
        return this.deckOfFact(fact) >= 0
    }

    deckOfFact(fact: Fact): number {
        let deck = this.deckByFact[fact.getId()]

        if (!deck) {
            return -1
        }
        else {
            return deck.index
        } 
    }

}

 export default LeitnerKnowledge