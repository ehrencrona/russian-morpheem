
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import InflectableWord from '../InflectableWord'
import { FORMS, GrammaticalCase, InflectionForm } from '../inflection/InflectionForms'

export class WordInFormMatch implements WordMatch {
    wordIds: { [id:string]: boolean}

    constructor(public words : InflectableWord[], public form: InflectionForm) {
        this.words = words
        this.form = form

        this.wordIds = {}

        this.words.forEach((w) => {
            this.wordIds[w.getId()] = true
        })
    }

    matches(words: Word[], wordPosition: number): number {
        let firstWord = words[wordPosition]
        let match = false

        if (firstWord instanceof InflectedWord &&
            this.wordIds[firstWord.word.getId()]) {
            let wordForm = FORMS[firstWord.form]

            match = this.form.matches(wordForm)
        }

        return (match ? 1 : 0)
    }

    allowEmptyMatch() {
        return false
    }

    isCaseStudy() {
        return false
    }

    toString() {
        return this.words.map((w) => w.getId()).join('|') + '@' + this.form.id
    }
}

export default WordInFormMatch
