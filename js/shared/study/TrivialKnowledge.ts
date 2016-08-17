
import Fact from '../fact/Fact'
import { Exposure, Knowledge } from '../study/Exposure'

interface LastStudied {
    fact: string,
    time: Date,
    knownTimes: number 
}

const MIN = 60 * 1000

// if we have got the fact right every time a certain number of times, 
// for how long are we sure to still think the fact is trivial?  
const FORGETTING_TIME = [
    0, 0, 0, MIN
]

for (let i = 0; i < 7; i++) {
    FORGETTING_TIME.push(FORGETTING_TIME[FORGETTING_TIME.length-1] * 5)
}

export default class TrivialKnowledge {

    known: { [ factId: string ]: LastStudied } = {}

    processExposures(exposures: Exposure[]) {

        exposures.forEach((exposure) => {

            if (exposure.knew == Knowledge.KNEW) {
                let lastStudied = this.known[exposure.fact]

                if (!lastStudied) {
                    lastStudied = {
                        fact: exposure.fact,
                        time: exposure.time,
                        knownTimes: 0
                    }

                    this.known[exposure.fact] = lastStudied
                }
                else if (exposure.time.getTime() - lastStudied.time.getTime() < 30000) {
                    // lots of fast exposures don't count
                    return
                }

                lastStudied.time = exposure.time
                lastStudied.knownTimes++
            }
            else {
                delete this.known[exposure.fact]
            }

        })

    }

    isKnown(fact: Fact) {
        return this.isKnownId(fact.getId())
    }

    isKnownId(factId: string) {
        let lastStudied = this.known[factId]

        if (!lastStudied) {
            return false
        }

        if (lastStudied.knownTimes >= FORGETTING_TIME.length) {
            return true
        }

        return (new Date().getTime()) - lastStudied.time.getTime() >= FORGETTING_TIME[lastStudied.knownTimes]
    }

    getAllTrivialFacts() {
        return Object.keys(this.known).filter((id) => this.isKnownId(id)) 
    }
}