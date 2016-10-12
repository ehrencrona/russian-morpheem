
import { StudyPlan, StudiedFacts, SerializedStudyPlan } from './StudyPlan'
import Fact from '../fact/Fact'
import Corpus from '../Corpus'
import FixedIntervalFactSelector from './FixedIntervalFactSelector'

function factEqualsFunction(fact: Fact) {
    let factId = fact.getId()
    return f => f.getId() == factId
}

export default class AbstractStudyPlan implements StudyPlan {
    studied: StudiedFacts
    queued: Fact[]
    originalExpectedRepetitions: number

    constructor(studyPlan: SerializedStudyPlan, public corpus: Corpus) {
        let studied: StudiedFacts
        let queued: Fact[]

        if (studyPlan) {
            let idsToFacts = (ids: string[]) => ids.map(id => corpus.facts.get(id)).filter(f => !!f)

            studied = new StudiedFacts(idsToFacts(studyPlan.newFacts), idsToFacts(studyPlan.repeatedFacts))
            queued = idsToFacts(studyPlan.queued)
            this.originalExpectedRepetitions = studyPlan.originalExpectedRepetitions
        }
        else {
            studied = new StudiedFacts([], [])
            queued = []
        }

        this.studied = studied
        this.queued = queued
        this.corpus = corpus
    }

    isStudiedFact(fact: Fact) {
        let match = factEqualsFunction(fact)
        let facts = this.getFacts()

        return !!facts.newFacts.find(match) || !!facts.repeatedFacts.find(match)
    }

    getFacts(): StudiedFacts {
        return this.studied
    }

    setFacts(facts: StudiedFacts, knowledge: FixedIntervalFactSelector) {
        this.studied = facts

        this.originalExpectedRepetitions = calculateExpectedRepetitions(facts, knowledge)
    }

    getProgress(knowledge: FixedIntervalFactSelector): number {
        let expectedRepetitions = calculateExpectedRepetitions(this.getFacts(), knowledge)

console.log('expected reps', expectedRepetitions,'vs originally', this.originalExpectedRepetitions)

        return 1 - Math.min(1, expectedRepetitions / this.originalExpectedRepetitions)
    }

    clear() {
        this.studied = new StudiedFacts([], [])
        this.originalExpectedRepetitions = 0
    }

    isQueuedFact(fact: Fact): boolean {
        let match = factEqualsFunction(fact)
        
        return !!this.getQueuedFacts().find(match)
    }

    getQueuedFacts(): Fact[] {
        return this.queued
    }

    queueFact(fact: Fact) {
        this.queued.push(fact)
    }

    isEmpty(): boolean {
        let facts = this.getFacts()

        return !facts.newFacts.length && !facts.repeatedFacts.length
    }

    serialize(): SerializedStudyPlan {
        let factsToIds = (facts: Fact[]) => facts.map(f => f.getId())

        return  {
            newFacts: factsToIds(this.studied.newFacts),
            repeatedFacts: factsToIds(this.studied.repeatedFacts),
            queued: factsToIds(this.queued),
            originalExpectedRepetitions: this.originalExpectedRepetitions
        }
    }
}

function calculateExpectedRepetitions(facts: StudiedFacts, knowledge: FixedIntervalFactSelector) {
    let result = 0

    facts.getAll().forEach(fact => {
        result += knowledge.getExpectedRepetitions(fact)
    })

    return result
}