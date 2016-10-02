
import Fact from '../fact/Fact'

export interface Relation {
    fact: string
    // will probably gain some kind of type, e.g. "synonym" or "antonym"
}

export interface Factoid {
    explanation: string
    fact?: string

    relations: Relation[]
}

export interface Factoids {

    setFactoid(factoid: Factoid, fact: Fact): Promise<any>

    getFactoid(fact: Fact): Promise<Factoid>

    getAll(): Promise<Factoid[]>

}