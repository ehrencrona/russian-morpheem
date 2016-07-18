
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import FactScore from './FactScore'
import { Exposure, Knowledge } from '../study/Exposure'

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

export default class FixedIntervalFactSelector {

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
                    else if (lastStudied.repetition > 0) {
                        lastStudied.repetition--
                    }
                }
            }
        })
    }

    isStudied(fact: Fact, now: Date): boolean {
        let lastStudied = this.studying[fact.getId()]
        
        if (lastStudied) {
            return INTERVAL_BY_REP_IN_MS[Math.min(lastStudied.repetition, REPETITION_COUNT-1)].max < timeSince(lastStudied, now)
        }
        else {
            return false
        }
    }

    chooseFact(now: Date): FactScore[] {
        let result: FactScore[] = []

        Object.keys(this.studying).forEach((factId) => {
            let lastStudied = this.studying[factId]

            let age = timeSince(lastStudied, now)
            let interval = INTERVAL_BY_REP_IN_MS[Math.min(lastStudied.repetition, REPETITION_COUNT-1)]

            if (age < interval.max && age > interval.min) {
                let score = (interval.max - age) / (interval.max - interval.min) * URGENCY + BASE_SCORE

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
            let interval = INTERVAL_BY_REP_IN_MS[Math.min(lastStudied.repetition, REPETITION_COUNT-1)]

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
}

function timeSince(lastStudied: LastStudied, now: Date) {
    return now.getTime() - lastStudied.time.getTime()    
}