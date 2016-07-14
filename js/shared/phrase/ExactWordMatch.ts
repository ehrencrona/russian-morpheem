
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import InflectableWord from '../InflectableWord'
import { FORMS, GrammaticalCase } from '../inflection/InflectionForms'

export type AnyWord = InflectableWord | Word

export class ExactWordMatch implements WordMatch {
    constructor(public word : AnyWord) {
        this.word = word
    }

    matches(words: Word[], wordPosition: number): number {
        let firstWord = words[wordPosition]
        let match = false

        if (firstWord) {
            if (this.word instanceof InflectableWord) {
                match =
                    firstWord instanceof InflectedWord &&
                    this.word.getId() == firstWord.word.getId()
            }
            else {
                match = firstWord.getId() == this.word.getId()
            }
        }

        return (match ? 1 : 0)
    }

    allowEmptyMatch() {
        return false
    }

    toString() {
        let result = this.word.getId()
        
        if (result.indexOf('@') < 0) {
            result += '@'
        }

        return result
    }
}

export default ExactWordMatch
