
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import InflectableWord from '../InflectableWord'
import { FORMS, GrammaticalCase } from '../inflection/InflectionForms'

export type AnyWord = InflectableWord | Word

export class ExactWordMatch implements WordMatch {
    wordIds: { [id:string]: boolean} = {}

    constructor(public words : AnyWord[]) {
        this.words = words

        this.words.forEach((w) => {
            this.wordIds[w.getId()] = true
        })
    }

    matches(words: Word[], wordPosition: number): number {
        let firstWord = words[wordPosition]
        let match = false

        if (firstWord) {
            if (firstWord instanceof InflectedWord && this.wordIds[firstWord.word.getId()]) {
                match = true
            }

            if (this.wordIds[firstWord.getId()]) {
                match = true
            }
        }

        return (match ? 1 : 0)
    }

    setCorpus() {
    }

    allowEmptyMatch() {
        return false
    }

    isCaseStudy() {
        return false
    }
    
    toString() {
        let result = this.words.map((w) => w.getId()).join('|')

        if (result.indexOf('@') < 0) {
            result += '@'
        }

        return result
    }
}

export default ExactWordMatch
