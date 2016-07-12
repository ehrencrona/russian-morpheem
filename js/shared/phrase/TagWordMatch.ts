
import WordMatch from './WordMatch'
import Word from '../Word'
import Facts from '../fact/Facts'
import Fact from '../fact/Fact'
import InflectedWord from '../InflectedWord'
import { FORMS, GrammaticalCase } from '../inflection/InflectionForms'

export default class TagWordMatch implements WordMatch {
    constructor(public tag : string, public facts: Facts) {
        this.facts = facts
        this.tag = tag
    }

    matches(words: Word[]) {
        for (let i = 0; i < words.length; i++) {
            let word = words[i]

            let fact: Fact = word as Fact

            if (word instanceof InflectedWord) {
                fact = word.word
            }

            let tags = this.facts.getTagsOfFact(fact)

            if (tags.indexOf(this.tag) < 0) {
                return i
            }
        }

        return words.length
    }

    toString() {
        return 'tag:' + this.tag.replace(' ', '_')
    }
}