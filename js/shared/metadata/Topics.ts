
import Fact from '../fact/Fact'

export interface Topic {
    id: string
    name: string
    description: string

    addFact(fact: Fact)
    removeFact(fact: Fact)
    getFacts(): Fact[]

    hasFact(fact: Fact)

    serialize(): SerializedTopic
}

export interface Topics {
    addTopic(id: string): Promise<Topic>

    setTopic(topic: Topic): Promise<any>

    getTopic(id: string): Promise<Topic>

    getAll(): Promise<Topic[]>

    getTopicsOfFact(fact: Fact): Promise<Topic[]>
}

export class SerializedTopic {
    id: string
    name: string
    description: string
    facts: string[]    
}
