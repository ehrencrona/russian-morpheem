
import WordMatch from './WordMatch'
import Word from '../Word'
import Words from '../Words'
import Facts from '../fact/Facts'
import Fact from '../fact/Fact'
import MatchContext from './MatchContext'

export default class WildcardMatch implements WordMatch {
    matches(context: MatchContext, wordPosition: number, matches: WordMatch[], 
        matchPosition: number): number {
        let words = context.words

        if (matchPosition >= matches.length-1) {
            return 0
        }

        for (let i = wordPosition; i < words.length; i++) {
            if (words[i].isPunctuation()) {
                return 0 
            }

            if (matches[matchPosition+1].matches(
                context, i, matches, matchPosition+1) > 0) {
                return i - wordPosition
            }
        }

        return 0
    }

    getInflectionForm() {
        return null
    }

    setCorpus() {
    }

    isCaseStudy() {
        return false
    }

    allowEmptyMatch() {
        return true
    }

    toString() {
        return 'any'
    }
}