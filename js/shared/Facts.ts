
import Grammar from './Grammar';
import InflectionFact from './InflectionFact';
import InflectableWord from './InflectableWord';
import InflectedWord from './InflectedWord';
import Fact from './Fact';
import Inflections from './Inflections';
import Word from './Word';
import Words from './Words';

const INFLECTION = 'i'
const INFLECTABLE = 'ib'
const WORD = 'w'

export default class Facts {
    factsById : { [s: string]: Fact } = {}
    facts : Fact[] = []
    factIndexById : { [id: string]: number } = {}

    onMove: (fact: Fact, newIndex: number) => void = null
    onAdd: (fact: Fact) => void = null

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
        
        if (this.onAdd) {
            this.onAdd(fact)
        }

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
            
            if (factJson.type == INFLECTION) {
                fact = inflections.getForm(factJson.id)

                if (!fact) {
                    throw new Error(`Unknown inflection "${factJson.id}".`)
                }
            }
            else if (factJson.type == INFLECTABLE) {
                fact = words.get(factJson.id)

                if (fact instanceof InflectedWord) {
                    fact = fact.word
                }
                else if (!fact) {
                    throw new Error('Didnt find word "' +  factJson.id + '" to base inflectable on.')
                }
                else {
                    throw new Error('Expected "' + factJson.id + '" to inflect')
                }
            }
            else if (factJson.type == WORD) {
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
                type = INFLECTION
            }
            else if (fact instanceof InflectableWord) {
                type = INFLECTABLE

                // this is not very satisfying. probably, 
                // the order of loading a corpus from JSON should be refactored.
                return {
                    id: fact.getId() + '@' + fact.inflection.defaultForm,
                    type: type
                }
            }
            else if (fact instanceof Word) {
                type = WORD
            } 
            else {
               throw new Error('Unknown fact type ' + fact.constructor.name)
            }
            
            return {
                id: fact.getId(),
                type: type
            }
        })
    }
}