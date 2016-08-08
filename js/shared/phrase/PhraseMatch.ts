
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import InflectableWord from '../InflectableWord'
import { FORMS, GrammaticalCase } from '../inflection/InflectionForms'
import Phrase from './Phrase'
import Corpus from '../../shared/Corpus'
import Facts from '../../shared/fact/Facts'

export class PhraseMatch implements WordMatch {
    phrase: Phrase
    corpus: Corpus

    constructor(public phraseId: string) {
        this.phraseId = phraseId
    }

    matches(words: Word[], wordPosition: number, matches: WordMatch[], 
            matchPosition: number): number {
        let m = this.phrase.match(words.slice(wordPosition), this.corpus.facts)

        if (m) {
            return m.words.length
        }
        else {
            return 0
        }
    }

    setCorpus(corpus: Corpus) {
        this.corpus = corpus
        this.phrase = corpus.phrases.get(this.phraseId)

        if (!this.phrase) {
            throw new Error(`Unknown phrase ${this.phraseId}`)
        }
    }

    allowEmptyMatch() {
        return false
    }

    isCaseStudy() {
        return false
    }
    
    toString() {
        return 'phrase:' + this.phraseId
    }
}

export default PhraseMatch
