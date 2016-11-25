import AnyWord from '../AnyWord';
import { post } from 'request';
import { inflate } from 'zlib';

import WordMatch from './WordMatch'
import CaseStudyMatch from './CaseStudyMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'

import { FORMS } from '../inflection/InflectionForms'
import { GrammarCase, PartOfSpeech } from '../inflection/Dimensions';
import InflectionForm from '../inflection/InflectionForm'
import { NamedWordForm, WordForm } from '../inflection/WordForm'

import { EXACT_MATCH_QUANTIFIER, ANY_MATCH_QUANTIFIER, AT_LEAST_ONE_QUANTIFIER } from './AbstractQuantifierMatch'
import AbstractFormMatch from './AbstractFormMatch'
import MatchContext from './MatchContext'

function getDefaultQuantifier(wordForms: NamedWordForm[]) {
    return wordForms.find(f => !!f.pos) ? AT_LEAST_ONE_QUANTIFIER : EXACT_MATCH_QUANTIFIER
}

export default class PosFormWordMatch extends AbstractFormMatch implements CaseStudyMatch, WordMatch {
    constructor(wordForms: NamedWordForm[], inflectionForm : InflectionForm, quantifier?: string) {
        super(wordForms, inflectionForm, quantifier || getDefaultQuantifier(wordForms))
    }

    wordMatches(word: AnyWord, context: MatchContext) {
        if (!this.matchesWordForm(word.wordForm, context)) {
            return false
        }

        if (word instanceof Word && (!this.inflectionForm || 
                // this is primarily for the matching of adjectives as possessives
                this.inflectionForm.equals({ grammaticalCase: GrammarCase.CONTEXT }))) { 
            return true
        }
        else if (word instanceof InflectedWord) {
            let wordForm = FORMS[word.form]

            return wordForm && this.matchesInflectionForm(wordForm, context) 
        }
    }

    getInflectionForm() {
        return this.inflectionForm
    }

    setCorpus() {
    }

    toString() {
        return this.getFormString()
            + (this.quantifier != getDefaultQuantifier(this.wordForms) ? this.quantifier : '')
    }
}