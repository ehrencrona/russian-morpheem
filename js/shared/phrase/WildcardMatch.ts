
import WordMatch from './WordMatch'
import Word from '../Word'
import Facts from '../fact/Facts'
import Fact from '../fact/Fact'

export default class WildcardMatch implements WordMatch {
    matches(words: Word[], wordPosition: number, matches: WordMatch[], 
        matchPosition: number, facts: Facts): number {
        if (matchPosition >= matches.length-1) {
            return 0
        }

        for (let i = wordPosition; i < words.length; i++) {
            if (matches[matchPosition+1].matches(
                words, i, matches, matchPosition+1, facts) > 0) {
                return i - wordPosition
            }
        }

        return 0
    }

    allowEmptyMatch() {
        return true
    }

    toString() {
        return 'any'
    }
}