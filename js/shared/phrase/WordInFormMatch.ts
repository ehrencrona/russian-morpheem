
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import InflectableWord from '../InflectableWord'
import AbstractFormMatch from './AbstractFormMatch'
import MatchContext from './MatchContext'
import FORMS from '../inflection/InflectionForms'
import { GrammarCase } from '../inflection/Dimensions'
import InflectionForm from '../inflection/InflectionForm'

export class WordInFormMatch extends AbstractFormMatch {
    wordIds: { [id:string]: boolean}

    constructor(public words : InflectableWord[], form: InflectionForm, quantifier: string) {
        super([], form, quantifier || '!')

        this.words = words

        this.wordIds = {}

        this.words.forEach((w) => {
            this.wordIds[w.getId()] = true
        })
    }

    wordMatches(word: Word, context: MatchContext) {
        if (word instanceof InflectedWord &&
            this.wordIds[word.word.getId()]) {
            let wordForm = FORMS[word.form]
            return this.matchesInflectionForm(wordForm, context)
        }
        else {
            return false
        }
    }

    getInflectionForm() {
        return this.range[0] > 0 && this.inflectionForm
    }

    isCaseStudy() {
        return false
    }

    getCaseStudied() {
        return null
    }

    toString() {
        return this.words.map((w) => w.getId()).join('|') + '@' + this.inflectionForm.id
    }
}

export default WordInFormMatch
