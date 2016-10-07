
import Fact from '../fact/Fact'

export class StudiedFacts {
    constructor(public newFacts: Fact[], public repeatedFacts: Fact[]) {
        this.newFacts = newFacts
        this.repeatedFacts = repeatedFacts
    }
}

export interface StudyPlan {

    isStudiedFact(fact: Fact): boolean
    getFacts(): StudiedFacts

    // side-effect: removes all studied facts from the queue
    setFacts(facts: StudiedFacts)

    isQueuedFact(fact: Fact): boolean
    getQueuedFacts(): Fact[]
    queueFact(fact: Fact)

    isEmpty(): boolean

    serialize(): SerializedStudyPlan

}

export interface SerializedStudyPlan {
    newFacts: string[]
    repeatedFacts: string[]
    queued: string[]
}

export default StudyPlan 