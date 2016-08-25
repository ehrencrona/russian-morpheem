
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import InflectableWord from '../InflectableWord'
import AbstractFormMatch from './AbstractFormMatch'
import MatchContext from './MatchContext'
import { FORMS, GrammaticalCase, InflectionForm } from '../inflection/InflectionForms'

export class WordInFormMatch extends AbstractFormMatch {
    wordIds: { [id:string]: boolean}

    constructor(public words : InflectableWord[], form: InflectionForm) {
        super(form, '!')

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
            return this.matchesForm(wordForm, context)
        }
        else {
            return false
        }
    }

    isCaseStudy() {
        return false
    }

    getCaseStudied() {
        return
    }

    toString() {
        return this.words.map((w) => w.getId()).join('|') + '@' + this.form.id
    }
}

export default WordInFormMatch
