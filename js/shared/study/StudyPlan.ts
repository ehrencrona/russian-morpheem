
import Fact from '../fact/Fact'
import FixedIntervalFactSelector from '../../shared/study/FixedIntervalFactSelector'

export class StudiedFacts {
    constructor(public newFacts: Fact[], public repeatedFacts: Fact[]) {
        this.newFacts = newFacts
        this.repeatedFacts = repeatedFacts
    }

    getAll(): Fact[] {
        return this.newFacts.concat(this.repeatedFacts)
    }
}

export interface StudyPlan {

    isStudiedFact(fact: Fact): boolean
    getFacts(): StudiedFacts

    // side-effect: removes all studied facts from the queue 
    // also resets progress
    setFacts(facts: StudiedFacts, knowledge: FixedIntervalFactSelector)

    // 0 to 1
    getProgress(knowledge: FixedIntervalFactSelector): number

    isQueuedFact(fact: Fact): boolean
    getQueuedFacts(): Fact[]
    queueFact(fact: Fact)

    clear() 
    
    isEmpty(): boolean

    serialize(): SerializedStudyPlan

}

export interface SerializedStudyPlan {
    newFacts: string[]
    repeatedFacts: string[]
    queued: string[]

    // the number of repetitions left when the facts were
    // assigned to the plan. progress is defined as 
    // 1 - (currently expected repetitions - original expected repetitions) / original expected repetitions 
    originalExpectedRepetitions: number
}

export default StudyPlan 