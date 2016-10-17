
import Fact from '../fact/Fact'
import { Exposure, Knowledge, Skill } from '../study/Exposure'

interface SkillStats {
    fact: string,
    firstKnew: Date,
    lastKnew: Date,
    knownTimes: number 
}

interface LastStudied {
    production: SkillStats
    recognition: SkillStats
}

const MIN = 60 * 1000
const DAY = 24 * 60 * MIN

/**
 * Keeps track of facts the learner will consider to be trivial and not worth mentioning.
 */
export default class TrivialKnowledge {

    known: { [ factId: string ]: LastStudied } = {}

    processExposures(exposures: Exposure[]) {

        exposures.forEach((exposure) => {

            if (exposure.knew == Knowledge.KNEW) {
                let lastStudied = this.known[exposure.fact]

                if (!lastStudied) {
                    lastStudied = {
                        production: null, 
                        recognition: null
                    }

                    this.known[exposure.fact] = lastStudied
                }


                let skillStats = (exposure.skill == Skill.PRODUCTION ? lastStudied.production : lastStudied.recognition)

                if (!skillStats) {
                    skillStats = {
                        fact: exposure.fact,
                        firstKnew: exposure.time,
                        lastKnew: exposure.time,
                        knownTimes: 0
                    }

                    if (exposure.skill == Skill.PRODUCTION) {
                        lastStudied.production = skillStats
                    } 
                    else {
                        lastStudied.recognition = skillStats 
                    } 
                }

                skillStats.lastKnew = exposure.time
                skillStats.knownTimes++
            }
            else {
                delete this.known[exposure.fact]
            }

        })

    }

    isKnown(fact: Fact, skill: Skill) {
        return this.isKnownId(fact.getId(), skill)
    }

    isKnownId(factId: string, skill: Skill) {
        let lastStudied = this.known[factId]

        if (!lastStudied) {
            return false
        }

        let hasSkill = (skillStats: SkillStats) => {
            if (!skillStats) {
                return false
            }

            if (skillStats.knownTimes < 2) {
                return false
            }

            return new Date().getTime() + skillStats.firstKnew.getTime() <
                2 * skillStats.lastKnew.getTime()
        }

        if (skill == Skill.PRODUCTION) {
            return hasSkill(lastStudied.production)
        } 
        else {
            return hasSkill(lastStudied.recognition) || hasSkill(lastStudied.production)
        } 

    }

    getAllTrivialFacts(skill: Skill) {
        return Object.keys(this.known).filter((id) => this.isKnownId(id, skill)) 
    }
}