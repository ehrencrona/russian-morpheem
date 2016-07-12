
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import PhraseMatch from './PhraseMatch'
import Words from '../Words'
import Word from '../Word'

export interface JsonFormat {
    id: string,
    patterns: string[],
    description: string
}

export default class Phrase implements Fact {
    description: string = ''

    constructor(public id: string, public patterns: PhraseMatch[]) {
        this.id = id
        this.patterns = patterns
    }

    static fromString(id: string, str: string, words: Words) {
        return new Phrase(
            id,
            str.split(',').map((str) => 
                PhraseMatch.fromString(str.trim(), words)))
    }

    match(words: Word[], facts: Facts): Word[] {
        for (let i = 0; i < this.patterns.length; i++) {
            let match = this.patterns[i].match(words, facts)

            if (match) {
                return match
            }
        }
    }

    toString() {
        return this.patterns.map((p) => p.toString()).join(', ')
    }

    getId() {
        return this.id
    }

    visitFacts(visitor: (Fact) => any) {
        visitor(this)
    }
    
    toJson(): JsonFormat {
        return {
            id: this.id,
            description: this.description,
            patterns: this.patterns.map((p) => p.toString())
        }
    }

    static fromJson(json: JsonFormat, words: Words): Phrase {
        let result = new Phrase(
            json.id,
            json.patterns.map((str) => 
                PhraseMatch.fromString(str, words))
        )

        result.description = json.description

        return result
    }
}