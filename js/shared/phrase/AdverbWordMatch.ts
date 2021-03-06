
import WordMatch from './WordMatch'
import CaseStudyMatch from './CaseStudyMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import FORMS from '../inflection/InflectionForms'
import { PartOfSpeech as PoS } from '../inflection/Dimensions'
import { EXACT_MATCH_QUANTIFIER, ANY_MATCH_QUANTIFIER, AT_LEAST_ONE_QUANTIFIER } from './AbstractQuantifierMatch'
import AbstractQuantifierMatch from './AbstractQuantifierMatch'

export const POS_NAMES = {
    noun: 'n',
    adjective: 'adj',
    verb: 'v',
    numeral: 'num',
    pronoun: 'pron'
}

export default class AdverbWordMatch extends AbstractQuantifierMatch {
    posName: string 

    constructor(quantifier?: string) {
        super(quantifier)
    }

    wordMatches(word: Word): boolean {
        return word.wordForm.pos == PoS.ADVERB
    }

    isCaseStudy() {
        return false
    }

    getCaseStudied() {
        throw new Error('not case study')
    }

    setCorpus() {
    }

    getInflectionForm() {
        return null
    }

    toString() {
        return 'adverb' + (this.quantifier == EXACT_MATCH_QUANTIFIER ? '' : this.quantifier)
    }
}