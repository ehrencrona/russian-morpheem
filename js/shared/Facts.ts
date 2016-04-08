
import Grammar from './Grammar';
import Fact from './Fact';
import Inflections from './Inflections';

export default class Facts {
    factsById : { [s: string]: Fact } = {}
    facts : Fact[] = []

    constructor() {
    }

    get(id) {
        return this.factsById[id]
    }
    
    add(fact: Fact) {
        if (this.factsById[fact.getId()]) {
            console.log('Duplicate fact', fact)
        }

        this.factsById[fact.getId()] = fact
        this.facts.push(fact)
    }
    
    toJson() {
        return this.facts.map((fact) => fact.getId())
    }
}