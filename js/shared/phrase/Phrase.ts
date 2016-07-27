
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import PhrasePattern from './PhrasePattern'
import { JsonFormat as PhrasePatternJsonFormat } from './PhrasePattern'
import { CaseStudy, Match } from './PhrasePattern'
import Words from '../Words'
import Inflections from '../inflection/Inflections'
import InflectedWord from '../InflectedWord'
import Word from '../Word'

export interface JsonFormat {
    id: string,
    patterns: PhrasePatternJsonFormat[],
    description: string
}

export default class Phrase implements Fact {
    description: string = ''

    constructor(public id: string, public patterns: PhrasePattern[]) {
        this.id = id
        this.patterns = patterns
    }

    static fromString(id: string, str: string, en: string, words: Words, inflections: Inflections) {
        return new Phrase(
            id,
            str.split(',').map((str) => 
                PhrasePattern.fromString(str.trim(), en, words, inflections)))
    }

    match(words: Word[], facts: Facts, study?: CaseStudy): Match {
        for (let i = 0; i < this.patterns.length; i++) {
            let match = this.patterns[i].match(words, facts, study)

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
            patterns: this.patterns.map((p) => p.toJson())
        }
    }

    static fromJson(json: JsonFormat, words: Words, inflections: Inflections): Phrase {
        let result = new Phrase(
            json.id,
            json.patterns.map((p: PhrasePatternJsonFormat) => 
                PhrasePattern.fromJson(p, words, inflections))
        )

        result.description = json.description

        return result
    }
}