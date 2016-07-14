
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import { FORMS, InflectionForm } from '../inflection/InflectionForms'

export const POS_NAMES = {
    noun: 'n',
    adjective: 'adj',
    verb: 'v',
    numeral: 'num',
    pronoun: 'pron'
}

type Range = number[]

const EXACT_MATCH_QUANTIFIER = '!'

export const QUANTIFIERS: { [name: string]: Range } = {
    '?': [ 0, 1 ],
    '*': [ 0, 9 ],
    '+': [ 1, 9 ],
    '!': [ 1, 1 ]
}

export default class PoSWordMatch implements WordMatch {
    range: Range

    constructor(public pos : string, public posName: string, public quantifier?: string) {
        this.pos = pos
        this.posName = posName
        this.quantifier = quantifier || EXACT_MATCH_QUANTIFIER
        this.range = QUANTIFIERS[this.quantifier]

        if (!this.range) {
            throw new Error(`Unknown quantifier ${this.quantifier}`)
        } 
    }

    matches(words: Word[], wordPosition: number): number {
        let getMatchCount = () => {
            let stopBefore = Math.min(words.length, wordPosition + this.range[1])

            for (let i = wordPosition; i < stopBefore; i++) {
                let word = words[i]
    
                if (!(word instanceof InflectedWord) || 
                    (word.word.inflection.pos != this.pos)) {
                    return i - wordPosition
                }
            }

            return stopBefore - wordPosition
        }

        let matchCount = getMatchCount()

        if (matchCount < this.range[0]) {
            return 0
        }
        else {
            return matchCount
        }
    }

    allowEmptyMatch() {
        return this.range[0] == 0
    }

    toString() {
        return this.posName + (this.quantifier == EXACT_MATCH_QUANTIFIER ? '' : this.quantifier)
    }
}