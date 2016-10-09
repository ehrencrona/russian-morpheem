
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import FactScore from './FactScore'
import { Exposure, Knowledge } from '../study/Exposure'
import StudentProfile from '../study/StudentProfile'
import NaiveKnowledge from './NaiveKnowledge'
import Corpus from '../Corpus'
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

export type NewFactsSelector = (onlyFromStudyPlan: boolean) => FactScore[] 

export function createNewFactsSelector(profile: StudentProfile, knowledge: NaiveKnowledge, 
        factSelector: FixedIntervalFactSelector, score: number, count: number, corpus: Corpus) {
    return (onlyFromStudyPlan: boolean) => {
        let allFacts: Fact[]

        if (onlyFromStudyPlan) {
            let studiedFacts = profile.studyPlan.getFacts()

            allFacts = studiedFacts.newFacts.concat(studiedFacts.newFacts)
        }
        else {
            allFacts = corpus.facts.facts
        }

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

export default createNewFactsSelector