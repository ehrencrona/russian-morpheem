
import Fact from '../fact/Fact'
import Facts from '../fact/Facts'
import PhraseMatch from './PhraseMatch'
import { CaseStudy } from './PhraseMatch'
import Words from '../Words'
import Inflections from '../inflection/Inflections'
import Word from '../Word'

export interface JsonFormat {
    id: string,
    patterns: string[],
    description: string,
    en: string
}

interface EnglishBlock {
    placeholder: boolean,
    en: string
}

export default class Phrase implements Fact {
    en: string = ''
    description: string = ''

    constructor(public id: string, public patterns: PhraseMatch[]) {
        this.id = id
        this.patterns = patterns
    }

    static fromString(id: string, str: string, words: Words, inflections: Inflections) {
        return new Phrase(
            id,
            str.split(',').map((str) => 
                PhraseMatch.fromString(str.trim(), words, inflections)))
    }

    match(words: Word[], facts: Facts, study?: CaseStudy): number[] {
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
            patterns: this.patterns.map((p) => p.toString()),
            en: this.en
        }
    }

    getEnglishBlocks(): EnglishBlock[] {

        let split = this.en.match(/(\[[^\]]+\]|[^\[]+)/g)

        return split.map((str) => {

            str = str.trim()

            let en = str

            let placeholder = str[0] == '['

            if (placeholder) {
                en = str.substr(1, str.length-2)
            }

            return {
                placeholder: placeholder,
                en: en 
            }

        })

    }

    static fromJson(json: JsonFormat, words: Words, inflections: Inflections): Phrase {
        let result = new Phrase(
            json.id,
            json.patterns.map((str) => 
                PhraseMatch.fromString(str, words, inflections))
        )

        result.en = json.en
        result.description = json.description

        return result
    }
}