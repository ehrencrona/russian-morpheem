
import Fact from '../fact/Fact'

export interface Relation {
    fact: string
    // will probably gain some kind of type, e.g. "synonym" or "antonym"
}

export interface Factoid {
    explanation: string
    name?: string
    fact?: string
    relations: Relation[]
}

export interface Factoids {

    setFactoid(factoid: Factoid, fact: Fact): Promise<any>

    getFactoidAsync(fact: Fact): Promise<Factoid>
    
    getFactoid(fact: Fact): Factoid

    getAll(): Promise<Factoid[]>

}