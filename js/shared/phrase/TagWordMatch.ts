
import WordMatch from './WordMatch'
import CaseStudyMatch from './CaseStudyMatch'
import MatchContext from './MatchContext'
import AbstractFormMatch from './AbstractFormMatch'

import Word from '../Word'
import Corpus from '../Corpus'
import InflectedWord from '../InflectedWord'

import Facts from '../fact/Facts'
import Fact from '../fact/Fact'

import { FORMS } from '../inflection/InflectionForms'
import { GrammarCase } from '../inflection/Dimensions'
import InflectionForm from '../inflection/InflectionForm'
import { NamedWordForm, WordForm } from '../inflection/WordForm'

export default class TagWordMatch extends AbstractFormMatch implements WordMatch, CaseStudyMatch {
    corpus: Corpus

    constructor(public tag : string, wordForms: NamedWordForm[], inflectionForm: InflectionForm, quantifier: string) {
        super(wordForms, inflectionForm, quantifier || '!')
        this.tag = tag
    }

    wordMatches(word: Word, context: MatchContext): boolean {
        let fact: Fact = word as Fact

        if (word instanceof InflectedWord) {
            fact = word.word
        }

        let tags = this.corpus.facts.getTagsOfFact(fact)

        if (tags.indexOf(this.tag) < 0) {
            return false
        }

        if (!this.matchesWordForm(word.wordForm, context)) {
            return false
        }

        if (this.inflectionForm) {
            if (word instanceof InflectedWord) {
                let wordForm = FORMS[word.form]

                if (!this.matchesInflectionForm(wordForm, context)) {
                    return false
                }
            }
            else {
                return false
            }
        }

        return true
    }

    getInflectionForm() {
        return this.inflectionForm
    }
    
    setCorpus(corpus: Corpus) {
        this.corpus = corpus
    }

    allowEmptyMatch() {
        return false
    }

    toString() {
        return '#' + this.tag.replace(' ', '_') + this.getFormString()
    }
}