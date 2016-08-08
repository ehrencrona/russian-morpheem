
import WordMatch from './WordMatch'
import CaseStudyMatch from './CaseStudyMatch'
import Word from '../Word'
import Facts from '../fact/Facts'
import Fact from '../fact/Fact'
import Corpus from '../Corpus'
import InflectedWord from '../InflectedWord'
import { FORMS, InflectionForm, GrammaticalCase } from '../inflection/InflectionForms'

export default class TagWordMatch implements WordMatch, CaseStudyMatch {
    corpus: Corpus

    constructor(public tag : string, public form: InflectionForm) {
        this.tag = tag
        this.form = form
    }

    matches(words: Word[], wordPosition: number, matches: WordMatch[], 
        matchPosition: number): number {
        
        for (let i = wordPosition; i < words.length; i++) {
            let word = words[i]

            let fact: Fact = word as Fact

            if (word instanceof InflectedWord) {
                fact = word.word
            }

            let tags = this.corpus.facts.getTagsOfFact(fact)

            if (this.form) {
                if (word instanceof InflectedWord) {
                    let wordForm = FORMS[word.form]

                    if (!this.form.matches(wordForm)) {
                        return i - wordPosition 
                    }
                }
                else {
                    return i - wordPosition 
                }
            }

            if (tags.indexOf(this.tag) < 0) {
                return i - wordPosition
            }
        }

        return words.length - wordPosition
    }

    setCorpus(corpus: Corpus) {
        this.corpus = corpus
    }

    isCaseStudy() {
        return !!(this.form && this.form.grammaticalCase)
    }

    getCaseStudied() {
        return this.form.grammaticalCase
    }

    allowEmptyMatch() {
        return false
    }

    toString() {
        return 'tag:' + this.tag.replace(' ', '_') + (this.form ? '@' + this.form.id : '')
    }
}