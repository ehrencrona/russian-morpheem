
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

    onMove: (fact: Fact, newIndex: number) => void = null

    constructor() {
    }

    get(id) {
        return this.factsById[id]
    }
    
    add(fact: Fact) {
        if (this.factsById[fact.getId()]) {
            console.error('Duplicate fact', fact, 'and', this.factsById[fact.getId()])
            return
        }

        this.factsById[fact.getId()] = fact
        this.factIndexById[fact.getId()] = this.facts.length
        this.facts.push(fact)
        
        return this
    }
    
    move(fact: Fact, pos: number) {
        let from = this.indexOf(fact)
        
        if (from < 0) {
            throw new Error('Unknown fact')
        }
        
        this.facts.splice(from, 1)
        
        let newIndex = (from < pos ? pos - 1 : pos);

        this.facts.splice(newIndex, 0, fact)

        this.reindexFacts()

        if (this.onMove) {
            this.onMove(fact, pos)
        }
    }

    reindexFacts() {
        this.factIndexById = {}
        
        this.facts.forEach((fact, index) => {
            this.factIndexById[fact.getId()] = index
        })
    }

    indexOf(fact: Fact) {
        let result = this.factIndexById[fact.getId()]
        
        if (result === undefined) {
            return -1
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
                
                if (!fact) {
                    throw new Error(`Unknown word "${factJson.id}". Did you mean "${words.getSimilarTo(factJson.id)}"`)
                }
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