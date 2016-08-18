
import Fact from '../fact/Fact'
import { Exposure, Knowledge, Skill } from '../study/Exposure'

interface LastStudied {
    fact: string,
    firstKnew: Date,
    lastKnew: Date,
    knownTimes: number 
}

const MIN = 60 * 1000
const DAY = 24 * 60 * MIN

export default class TrivialKnowledge {

    known: { [ factId: string ]: LastStudied } = {}

    processExposures(exposures: Exposure[]) {

        exposures.forEach((exposure) => {

            if (exposure.knew == Knowledge.KNEW) {
                if (exposure.skill != Skill.RECOGNITION) {
                    let lastStudied = this.known[exposure.fact]

                    if (!lastStudied) {
                        lastStudied = {
                            fact: exposure.fact,
                            firstKnew: exposure.time,
                            lastKnew: exposure.time,
                            knownTimes: 0
                        }

                        this.known[exposure.fact] = lastStudied
                    }

                    lastStudied.lastKnew = exposure.time
                    lastStudied.knownTimes++
                }
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

        if (lastStudied.knownTimes < 2) {
            return false
        }

        return new Date().getTime() + lastStudied.firstKnew.getTime() <
            2 * lastStudied.lastKnew.getTime()
    }

    getAllTrivialFacts() {
        return Object.keys(this.known).filter((id) => this.isKnownId(id)) 
    }
}