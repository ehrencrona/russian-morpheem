
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

    matches(words: Word[]) {
        if (words.length &&
            words[0].getId() == this.word.getId()) {
            return 1
        }
        else {
            return 0
        }
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
