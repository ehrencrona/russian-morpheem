
import Grammar from './Grammar';
import InflectionFact from './InflectionFact';
import Fact from './Fact';
import Inflections from './Inflections';
import Word from './Word';
import Words from './Words';

export default class Facts {
    factsById : { [s: string]: Fact } = {}
    facts : Fact[] = []
    factIndexById : { [id: string]: number } = {}

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
        this.factIndexById[fact.getId()] = this.facts.length
        this.facts.push(fact)
        
        return this
    }
    
    indexOf(fact: Fact) {
        let result = this.factIndexById[fact.getId()]
        
        if (result === undefined) {
            throw new Error(`Unknown fact ${fact.getId()}`)
        }
        
        return result
    }
    
    static fromJson(json, inflections: Inflections, words: Words) {
        let facts = new Facts()
        
        json.forEach((factJson) => {
            let fact 
            
            if (factJson.type == 'inflect') {
                fact = inflections.getForm(factJson.id)
            }
            else if (factJson.type == 'word') {
                fact = words.get(factJson.id);
            }
            else {
                throw new Error(`Unknown fact type "${factJson.type}""`)
            }
            
            facts.add(fact)
        })
        
        return facts
    }
    
    toJson() {
        return this.facts.map((fact) => {
            let type
            
            if (fact instanceof InflectionFact) {
                type = 'inflect'
            }
            else if (fact instanceof Word) {
                type = 'word'
            } 
            else {
               throw new Error('Unknown fact type ' + fact)
            }
            
            return {
                id: fact.getId(),
                type: type
            }
        })
    }
}