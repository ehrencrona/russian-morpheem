
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import InflectableWord from '../InflectableWord'
import MatchContext from './MatchContext'
import Corpus from '../Corpus'

import { FORMS } from '../inflection/InflectionForms'

export type AnyWord = InflectableWord | Word

export class ExactWordMatch implements WordMatch {
    wordIds: { [id:string]: boolean} = {}
    corpus: Corpus

    constructor(public words : AnyWord[]) {
        this.words = words

        this.words.forEach((w) => {
            this.wordIds[w.getId()] = true
            this.wordIds[w.getId() + '*'] = true
        })
    }

    matches(context: MatchContext, wordPosition: number): number {
        let words = context.words
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

    getForm() {
        for (let wordId in this.wordIds) {
            let word = this.corpus.words.get(wordId)

            if (word instanceof InflectedWord) {
                return FORMS[word.form]
            }
        }
    }

    setCorpus(corpus: Corpus) {
        this.corpus = corpus
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
