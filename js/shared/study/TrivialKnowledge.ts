
import Fact from '../fact/Fact'
import { Exposure, Knowledge } from '../study/Exposure'

interface LastStudied {
    fact: string,
    time: Date,
    knownTimes: number 
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

        return lastStudied.knownTimes >= 3
    }

    getAllTrivialFacts() {
        return Object.keys(this.known).filter((id) => this.isKnownId(id)) 
    }
}