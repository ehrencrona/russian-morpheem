
import Fact from '../fact/Fact'

export interface Factoid {
    explanation: string
    fact?: string
}

export interface Factoids {

    setFactoid(factoid: Factoid, fact: Fact): Promise<any>

    getFactoid(fact: Fact): Promise<Factoid>

    getAll(): Promise<Factoid[]>

}