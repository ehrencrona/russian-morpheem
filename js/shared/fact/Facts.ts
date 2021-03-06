import { NamedWordForm } from '../inflection/WordForm';

import InflectionFact from '../inflection/InflectionFact';
import InflectableWord from '../InflectableWord';
import InflectedWord from '../InflectedWord';
import FORMS from '../inflection/InflectionForms' 
import InflectionForm from '../inflection/InflectionForm'
import WORD_FORMS from '../inflection/WordForms' 
import Fact from './Fact';
import Inflections from '../inflection/Inflections';
import Word from '../Word';
import Words from '../Words';
import Corpus from '../Corpus';
import Phrase from '../phrase/Phrase';
import Phrases from '../phrase/Phrases';
import { EndingTransform } from '../Transforms'
import transforms from '../Transforms'
import TagFact from '../TagFact'

const INFLECTION = 'i'
const INFLECTABLE = 'ib'
const WORD = 'w'
const TRANSFORM = 't'
const PHRASE = 'p'
const INFLECTION_FORM = 'if'
const WORD_FORM = 'wf'
const TAG = 'g'

export interface FactJsonFormat {
    id: string,
    type: string,
    tags?: string[]
}

export type JsonFormat = FactJsonFormat[]

export const MISSING_INDEX = 9999998

export default class Facts {
    factsById : { [s: string]: Fact } = {}
    facts : Fact[] = []
    factIndexById : { [id: string]: number } = {}

    factIdsByTag: { [tag: string]: Set<string> } = {}
    tagsByFactIds: { [id: string]: string[] } = {}
    
    onMove: (fact: Fact, newIndex: number) => void = null
    onAdd: (fact: Fact) => void = null
    onRemove: (fact: Fact) => void = null
    onTag: (fact: Fact, tag: string) => void = null
    onUntag: (fact: Fact, tag: string) => void = null

    constructor() {
    }
    
    clone(facts: Facts) {
        this.factsById = facts.factsById
        this.facts = facts.facts
        this.factIndexById = facts.factIndexById
        this.factIdsByTag = facts.factIdsByTag
        this.tagsByFactIds = facts.tagsByFactIds
    }

    get(id) {
        return this.factsById[id]
    }
    
    add(fact: Fact) {
        if (!fact.getId()) {
            console.error('Fact', fact, 'had no ID')
            return
        }

        if (fact.getId() == 'undefined') {
            console.error('Fact', fact, 'had ID "undefined" (as string)')
            return
        }

        if (this.factsById[fact.getId()]) {
            console.error('Duplicate fact ' + fact.getId())
            return
        }

        this.factsById[fact.getId()] = fact
        this.factIndexById[fact.getId()] = this.facts.length
        this.facts.push(fact)

        if (fact instanceof Phrase) {
            fact.getCaseFacts().forEach((caseFact) => {
                // casefacts are placed at the same index but not present in the list of facts.
                this.factsById[caseFact.getId()] = caseFact                
                this.factIndexById[caseFact.getId()] = this.facts.length
            })
        }

        if (this.onAdd) {
            this.onAdd(fact)
        }

        return this
    }

    replace(fact: Fact, withFact: Fact) {
        if (withFact.getId() != fact.getId()) {
            throw new Error('Cannot replace with different ID')
        }

        this.factsById[fact.getId()] = withFact
        this.facts[this.indexOf(fact)] = withFact
    }

    remove(fact: Fact) {
        if (!this.factsById[fact.getId()]) {
            console.error('Unknown fact ' + fact.getId())
            return
        }

        delete this.factsById[fact.getId()]
        delete this.factIndexById[fact.getId()]
        this.facts = this.facts.filter((existingFact) => existingFact.getId() != fact.getId())
        
        if (this.onRemove) {
            this.onRemove(fact)
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
            return MISSING_INDEX
        }
        
        return result
    }

    getAllTags() {
        return Object.keys(this.factIdsByTag).sort()
    }

    getFactIdsWithTag(tag: string) {
        return this.factIdsByTag[tag] || new Set<string>()
    }
    
    getFactsWithTag(tag: string) {
        let factIds = this.getFactIdsWithTag(tag)
        
        return this.facts.filter((fact) => factIds.has(fact.getId()))
    }
    
    tag(fact: Fact, tag: string) {
        let factIds = this.factIdsByTag[tag]
        
        if (!factIds) {
            factIds = new Set()
            this.factIdsByTag[tag] = factIds
        }

        factIds.add(fact.getId())
        
        let tags = this.tagsByFactIds[fact.getId()]
        
        if (!tags) {
            tags = []
            this.tagsByFactIds[fact.getId()] = tags
        }

        let tagFact = this.get(tag)
 
        // note that this is never removed, but it's not really an issue
        // as it's only relevant in the frontend where the corpus is basically
        // read-only
        if (tagFact instanceof TagFact) {
            fact.requiresFact(tagFact)
        }
        
        if (tags.indexOf(tag) < 0) {
            tags.push(tag)

            if (this.onTag) {
                this.onTag(fact, tag )
            }
        }
    }
    
    untag(fact: Fact, tag: string) {
        let factIds = this.factIdsByTag[tag]
        
        if (!factIds) {
            factIds.delete(tag)
        }

        let tags = this.tagsByFactIds[fact.getId()]
        
        if (tags) {
            tags = tags.filter((existingTag) => existingTag != tag)
            
            if (tags.length == 0) {
                tags = null
            }

            this.tagsByFactIds[fact.getId()] = tags
        }

        if (this.onUntag) {
            this.onUntag(fact, tag)
        }
    }

    hasTag(fact: Fact, tag: string) {
        let tags = this.tagsByFactIds[fact.getId()]
        
        return tags && tags.indexOf(tag) >= 0
    }

    getTagsOfFact(fact: Fact) {
        return this.tagsByFactIds[fact.getId()] || []
    }

    static fromJson(json, inflections: Inflections, words: Words, phrases: Phrases) {
        let facts = new Facts()

        json.forEach((factJson: FactJsonFormat) => {
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
                    throw new Error('Didnt find word "' + factJson.id + '" to base inflectable on.')
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
            else if (factJson.type == PHRASE) {
                fact = phrases.get(factJson.id)

                if (!fact) {
                    throw new Error(`Unknown phrase "${factJson.id}".`)
                }
            }
            else if (factJson.type == TRANSFORM) {
                fact = transforms.get(factJson.id);
                
                if (!fact) {
                    throw new Error(`Unknown transform "${factJson.id}".`)
                }
            }
            else if (factJson.type == INFLECTION_FORM) {
                fact = FORMS[factJson.id];
                
                if (!fact) {
                    throw new Error(`Unknown inflection form "${factJson.id}".`)
                }
            }
            else if (factJson.type == WORD_FORM) {
                fact = WORD_FORMS[factJson.id];
                
                if (!fact) {
                    throw new Error(`Unknown word form "${factJson.id}".`)
                }
            }
            else if (factJson.type == TAG) {
                fact = new TagFact(factJson.id)
            }
            else {
                throw new Error(`Unknown fact type "${factJson.type}""`)
            }

            facts.add(fact)
            
            if (factJson.tags) {
                factJson.tags.forEach((tag) =>
                    facts.tag(fact, tag))
            }
        })
        
        return facts
    }
    
    toJson() {
        return this.facts.map((fact) => {
            let type
            
            let id = fact.getId()
            
            if (fact instanceof InflectionFact) {
                type = INFLECTION
            }
            else if (fact instanceof InflectableWord) {
                type = INFLECTABLE

                // this is not very satisfying. probably, 
                // the order of loading a corpus from JSON should be refactored.
                id = fact.getId() + '@' + fact.getDefaultInflection().form
            }
            else if (fact instanceof Word) {
                type = WORD
            } 
            else if (fact instanceof EndingTransform) {
                type = TRANSFORM
            }
            else if (fact instanceof Phrase) {
                type = PHRASE
            }
            else if (fact instanceof InflectionForm) {
                type = INFLECTION_FORM
            }
            else if (fact instanceof NamedWordForm) {
                type = WORD_FORM
            }
            else if (fact instanceof TagFact) {
                type = TAG
            }
            else {
               throw new Error('Unknown fact type ' + fact.constructor.name)
            }
            
            let result: FactJsonFormat = {
                id: id,
                type: type
            }

            let tags = this.getTagsOfFact(fact)

            if (tags.length) {
                result.tags = tags
            }

            return result
        })
    }
}