
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import FactScore from './FactScore'
import { Exposure, Knowledge } from '../study/Exposure'

export const REPETITION_COUNT = 9
const MIN_REPETITION = -1

export interface LastStudied {
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

// a guesstimate of a typical study session length. 
// only used to determine how many repetitions of a fact can fall due in a session
const STUDY_SESSION_LENGTH_MS = 30 * 60 * 1000;

// URGENCY + BASE_SCORE must equal 1
const URGENCY = 0.8
const BASE_SCORE = 0.2
const INTERVAL_FIRST_REP_IN_MS = { min: 1000, max: 10000 }

export const INTERVAL_BY_REP_IN_MS: Interval[] = [ INTERVAL_FIRST_REP_IN_MS ]

for (let rep = 1; rep < REPETITION_COUNT - MIN_REPETITION; rep++) {
    INTERVAL_BY_REP_IN_MS[rep] = {
        min: INTERVAL_BY_REP_IN_MS[rep-1].min * INCREASE_BY_REPETITION,
        max: INTERVAL_BY_REP_IN_MS[rep-1].max * INCREASE_BY_REPETITION
    } 
}

export const EXPECTED_REPETITIONS_IN_SESSION = calculateExpectedRepetitionsForNew(STUDY_SESSION_LENGTH_MS) 

function calculateExpectedRepetitionsForNew(sessionLength: number) {
    // how many repetitions can we at most do between now and "before", give that all answers are correct?
    // (note that this is basically a constant since "before"" is always now+sessionLength and could be calculated once and for all) 
    for (let reps = 0; reps < REPETITION_COUNT; reps++) {
        if (INTERVAL_BY_REP_IN_MS[reps - MIN_REPETITION].min > sessionLength) {
            return reps
        }
    }

    return REPETITION_COUNT
}

export class FixedIntervalFactSelector {

    exposed: { [ factId: string ]: LastStudied } = {}
    studying: { [ factId: string ]: LastStudied } = {}

    constructor(public facts: Facts ) {
        this.facts = facts
    }

    processExposures(exposures: Exposure[]) {

        exposures.forEach((exposure) => {

            if (exposure.knew == Knowledge.MAYBE) {
                return
            }

            let lastStudied = this.exposed[exposure.fact]

            if (!lastStudied) {
                lastStudied = {
                    fact: exposure.fact,
                    time: exposure.time,
                    repetition: 0
                }

                this.exposed[exposure.fact] = lastStudied
                
                if (exposure.knew == Knowledge.DIDNT_KNOW) {
                    this.studying[exposure.fact] = lastStudied
                }
            }
            else {
                lastStudied.time = exposure.time

                if (exposure.knew == Knowledge.KNEW) {
                    lastStudied.repetition++

                    if (lastStudied.repetition >= REPETITION_COUNT) {
                        delete this.studying[exposure.fact]
                    }
                }
                else {
                    this.studying[exposure.fact] = lastStudied

                    if (lastStudied.repetition >= REPETITION_COUNT) {
                        lastStudied.repetition = REPETITION_COUNT-1                    
                    }
                    else if (lastStudied.repetition > MIN_REPETITION) {
                        lastStudied.repetition--
                    }
                }
            }
        })
    }

    isEverStudied(fact: Fact): boolean {
        return !!this.studying[fact.getId()]
    }

    isFailingAtLearning(fact: Fact) {
        let lastStudied = this.studying[fact.getId()]
        
        return lastStudied && lastStudied.repetition < 0
    }

    isStudied(fact: Fact, now: Date): boolean {
        let lastStudied = this.studying[fact.getId()]
        
        if (lastStudied) {
            return INTERVAL_BY_REP_IN_MS[
                Math.min(lastStudied.repetition, REPETITION_COUNT-1) - MIN_REPETITION].max < timeSince(lastStudied, now)
        }
        else {
            return false
        }
    }

    /**
     * ever - true: repetitions made until fact is known over all sessions, false: repetitions in a single session
     */
    getExpectedRepetitions(fact: Fact, ever: boolean): number {
        let lastStudied = this.studying[fact.getId()]

        if (lastStudied) {
            if (!ever) {
                let before = new Date(new Date().getTime() + STUDY_SESSION_LENGTH_MS)

                let timeSinceLast = timeSince(lastStudied, before)

                // how many more repetitions will we at most manage before "before" if all answers
                // are correct? 
                for (let reps = lastStudied.repetition; reps < REPETITION_COUNT; reps++) {

                    if (INTERVAL_BY_REP_IN_MS[reps - MIN_REPETITION].min > timeSinceLast) {
                        // the current repetition will never be done, so the previous one is the last
                        return reps - lastStudied.repetition
                    }

                }
            }

            return REPETITION_COUNT - lastStudied.repetition
        }

        let exposed = this.exposed[fact.getId()]

        if (!exposed) {
            return (ever ? REPETITION_COUNT : EXPECTED_REPETITIONS_IN_SESSION)
        }
        else {
            return 0
        }
    }

    chooseFact(now: Date, amongFacts?: Fact[]): FactScore[] {
        let result: FactScore[] = []

        let factIds: string[]

        if (amongFacts) {
            factIds = amongFacts.map(f => f.getId())
        }
        else {
            factIds = Object.keys(this.studying)
        }

        factIds.forEach((factId) => {
            let lastStudied = this.studying[factId]

            if (!lastStudied) {
                return
            }

            let age = timeSince(lastStudied, now)
            let interval = INTERVAL_BY_REP_IN_MS[Math.min(lastStudied.repetition, REPETITION_COUNT-1) - MIN_REPETITION]

            if (age > interval.min) {
                let score
                
                if (age < interval.max) {
                    score = (interval.max - age) / (interval.max - interval.min) * URGENCY + BASE_SCORE
                }
                else {
                    score = BASE_SCORE
                }

                let fact = this.facts.get(factId)

                if (!fact) {
                    console.warn('Unknown fact ID ' + factId)
                    return
                }

                result.push({
                    score: score,
                    fact: fact,
                    debug: {
                        lastStudied: lastStudied,
                        age: Math.round(age / 1000),
                        intervalScore: score
                    }
                })
            }

        })

        return result
    }

    filterLastStudied(filter: (lastStudied: LastStudied, age: number, interval: Interval) => boolean) {
        let now = new Date()
        let result: LastStudied[] = []

        Object.keys(this.studying).forEach((factId) => {
            let lastStudied = this.studying[factId]

            let age = timeSince(lastStudied, now)
            let interval = INTERVAL_BY_REP_IN_MS[Math.min(lastStudied.repetition, REPETITION_COUNT-1) - MIN_REPETITION]

            if (filter(lastStudied, age, interval)) {
                let fact = this.facts.get(factId)

                result.push(lastStudied)
            }

        })

        return result
    }

    noLongerStudying() {
        return this.filterLastStudied((lastStudied, age, interval) => age > interval.min)
    }

    notYetStudying() {
        return this.filterLastStudied((lastStudied, age, interval) => age < interval.max)
    }

    getLastStudied(fact: Fact): LastStudied {
        return this.exposed[fact.getId()]
    }
}

export default FixedIntervalFactSelector

function timeSince(lastStudied: LastStudied, now: Date) {
    return now.getTime() - lastStudied.time.getTime()    
}