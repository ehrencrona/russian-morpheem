import { Topic, Topics, SerializedTopic } from './Topics'
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'

export default class AbstractTopic implements Topic {
    id: string
    name: string
    description: string
    facts: Fact[]
    factSet: Set<string> = new Set()

    constructor(topic: SerializedTopic, facts: Facts) {
        this.id = topic.id
        this.name = topic.name
        this.description = topic.description

        this.facts = topic.facts.map(fId => {
            let f = facts.get(fId)

            this.factSet.add(fId)

            if (!f) {
                console.error('Unknown fact ' + fId)
            }

            return f
        }).filter(f => !!f)
    }

    addFact(fact: Fact) {
        if (this.hasFact(fact)) {
            return
        }

        this.facts.push(fact)
        this.factSet.add(fact.getId())
    }

    removeFact(fact: Fact) {
        this.facts = this.facts.filter(existing => existing.getId() != fact.getId())

        this.factSet.delete(fact.getId())
    }

    hasFact(fact: Fact) {
        return this.factSet.has(fact.getId())
    }

    getFacts(): Fact[] {
        return this.facts
    }

    serialize(): SerializedTopic {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            facts: this.facts.map(f => f.getId())
        }
    }
}