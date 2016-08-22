
import WordMatch from './WordMatch'
import CaseStudyMatch from './CaseStudyMatch'
import Word from '../Word'
import Facts from '../fact/Facts'
import Fact from '../fact/Fact'
import Corpus from '../Corpus'
import InflectedWord from '../InflectedWord'
import { FORMS, InflectionForm, GrammaticalCase } from '../inflection/InflectionForms'
import MatchContext from './MatchContext'
import AbstractFormMatch from './AbstractFormMatch'

export default class TagWordMatch extends AbstractFormMatch implements WordMatch, CaseStudyMatch {
    corpus: Corpus

    constructor(public tag : string, form: InflectionForm) {
        super(form, '!')
        this.tag = tag
    }

    wordMatches(word: Word, context: MatchContext): boolean {
        let fact: Fact = word as Fact

        if (word instanceof InflectedWord) {
            fact = word.word
        }

        let tags = this.corpus.facts.getTagsOfFact(fact)

        if (this.form) {
            if (word instanceof InflectedWord) {
                let wordForm = FORMS[word.form]

                if (!this.matchesForm(wordForm, context)) {
                    return false
                }
            }
            else {
                return false
            }
        }

        if (tags.indexOf(this.tag) < 0) {
            return false
        }

        return true
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