
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

const MSG = 'Failure loading corpus'

export class EmptyFactoids {

    setFactoid(factoid: Factoid, fact: Fact) {
        return Promise.reject(new Error(MSG))
    }

    getFactoidAsync(fact: Fact): Promise<Factoid> {
        return Promise.reject(new Error(MSG))
    }
    
    getFactoid(fact: Fact): Factoid {
        return null
    }

    getAll(): Promise<Factoid[]> {
        return Promise.resolve([])
    }
    
}