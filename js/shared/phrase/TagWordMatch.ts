
import WordMatch from './WordMatch'
import Word from '../Word'
import Facts from '../fact/Facts'
import Fact from '../fact/Fact'
import InflectedWord from '../InflectedWord'
import { FORMS, InflectionForm, GrammaticalCase } from '../inflection/InflectionForms'

export default class TagWordMatch implements WordMatch {
    constructor(public tag : string, public form: InflectionForm) {
        this.tag = tag
        this.form = form
    }

    matches(words: Word[], wordPosition: number, matches: WordMatch[], 
        matchPosition: number, facts: Facts): number {
        
        for (let i = wordPosition; i < words.length; i++) {
            let word = words[i]

            let fact: Fact = word as Fact

            if (word instanceof InflectedWord) {
                fact = word.word
            }

            let tags = facts.getTagsOfFact(fact)

            if (this.form) {
                if (word instanceof InflectedWord) {
                    let wordForm = FORMS[word.form]

                    if ((this.form.grammaticalCase && this.form.grammaticalCase != wordForm.grammaticalCase) ||
                        (this.form.gender && this.form.gender != wordForm.gender) ||
                        (this.form.number && this.form.tense != wordForm.tense) ||
                        (this.form.tense && this.form.tense != wordForm.tense)) {
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

    toString() {
        return 'tag:' + this.tag.replace(' ', '_')
    }
}