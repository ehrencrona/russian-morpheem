
import WordMatch from './WordMatch'
import Word from '../Word'
import InflectedWord from '../InflectedWord'
import { FORMS, InflectionForm } from '../inflection/InflectionForms'

export const POS_NAMES = {
    noun: 'n',
    adjective: 'adj',
    verb: 'v',
    numeral: 'num',
    pronoun: 'pron'
}

export default class PoSWordMatch implements WordMatch {
    constructor(public pos : string) {
        this.pos = pos
    }

    matches(words: Word[], wordPosition: number): number {
        for (let i = wordPosition; i < words.length; i++) {
            let word = words[i]

            if (!(word instanceof InflectedWord) || 
                (word.word.inflection.pos != this.pos)) {
                return i - wordPosition
            }                
        }

        return words.length - wordPosition
    }

    toString() {
        return this.pos
    }
}