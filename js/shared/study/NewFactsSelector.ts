
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import FactScore from './FactScore'
import { Exposure, Knowledge } from '../study/Exposure'
import NaiveKnowledge from './NaiveKnowledge'
import FixedIntervalFactSelector from './FixedIntervalFactSelector'

const REPETITION_COUNT = 8

interface LastStudied {
    fact: string,
    time: Date,
    repetition: number
}

interface Interval {
    min: number,
    max: number
}

// this is the pimsleur factor
const INCREASE_BY_REPETITION = 5

// URGENCY + BASE_SCORE must equal 1
const URGENCY = 0.8
const BASE_SCORE = 0.2
const INTERVAL_FIRST_REP_IN_MS = { min: 5000, max: 25000 }

const INTERVAL_BY_REP_IN_MS: Interval[] = [ INTERVAL_FIRST_REP_IN_MS ]

for (let rep = 1; rep < REPETITION_COUNT; rep++) {
    INTERVAL_BY_REP_IN_MS[rep] = {
        min: INTERVAL_BY_REP_IN_MS[rep-1].min * INCREASE_BY_REPETITION,
        max: INTERVAL_BY_REP_IN_MS[rep-1].max * INCREASE_BY_REPETITION
    } 
}

export default function createNewFactsSelector(facts: Facts, knowledge: NaiveKnowledge, factSelector: FixedIntervalFactSelector, score: number, count: number ) {
    return () => {
        let allFacts = facts.facts

        let foundFacts: FactScore[] = []

        for (let i = 0; i < allFacts.length; i++) {
            let factKnowledge = knowledge.getKnowledge(allFacts[i])

            if ((factKnowledge == Knowledge.MAYBE || factKnowledge == Knowledge.DIDNT_KNOW) &&
                !factSelector.isStudied(allFacts[i], new Date())) {
                foundFacts.push({
                    fact: allFacts[i],
                    score: score,
                    debug: {
                        newFact: true,
                        factKnowledge: factKnowledge
                    }
                })

                if (foundFacts.length >= count) {
                    break
                }
            }
        }

        return foundFacts
    }
}
