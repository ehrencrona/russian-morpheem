
import { StudyPlan, StudiedFacts, SerializedStudyPlan } from './StudyPlan'
import Fact from '../fact/Fact'
import Corpus from '../corpus'

function factEqualsFunction(fact: Fact) {
    let factId = fact.getId()
    return f => f.getId() == factId
}

export default class AbstractStudyPlan implements StudyPlan {
    studied: StudiedFacts
    queued: Fact[]

    constructor(studyPlan: SerializedStudyPlan, public corpus: Corpus) {
        let studied: StudiedFacts
        let queued: Fact[]

        if (studyPlan) {
            let idsToFacts = (ids: string[]) => ids.map(id => corpus.facts.get(id)).filter(f => !!f)

            studied = new StudiedFacts(idsToFacts(studyPlan.newFacts), idsToFacts(studyPlan.repeatedFacts))
            queued = idsToFacts(studyPlan.queued)
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

    setFacts(facts: StudiedFacts) {
        this.studied = facts
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
            queued: factsToIds(this.queued)
        }
    }
}
