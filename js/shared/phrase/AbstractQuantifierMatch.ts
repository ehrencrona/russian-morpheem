
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import FORMS from '../inflection/InflectionForms'
import MatchContext from './MatchContext'
import Corpus from '../Corpus'

type Range = number[]

export const ANY_MATCH_QUANTIFIER = '*'
export const EXACT_MATCH_QUANTIFIER = '!'
export const AT_LEAST_ONE_QUANTIFIER = '+'

export const QUANTIFIERS: { [name: string]: Range } = {
    '?': [ 0, 1 ],
    '*': [ 0, 9 ],
    '+': [ 1, 9 ],
    '!': [ 1, 1 ]
}

export abstract class AbstractQuantifierMatch implements WordMatch {
    range: Range

    constructor(public quantifier?: string) {
        this.quantifier = quantifier || EXACT_MATCH_QUANTIFIER
        this.range = QUANTIFIERS[this.quantifier]

        if (!this.range) {
            throw new Error(`Unknown quantifier ${this.quantifier}`)
        } 
    }

    abstract wordMatches(word: Word, context: MatchContext): boolean
    
    abstract getCaseStudied()
    
    abstract isCaseStudy()

    abstract getInflectionForm()
    
    setCorpus(corpus: Corpus) {
    }

    matches(context: MatchContext, wordPosition: number): number {
        let words = context.words
        
        let getMatchCount = () => {
            let stopBefore = Math.min(words.length, wordPosition + this.range[1])

            for (let i = wordPosition; i < stopBefore; i++) {
                let word = words[i]
    
                if (!this.wordMatches(word, context)) {
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
}

export default AbstractQuantifierMatch