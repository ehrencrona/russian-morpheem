
import Fact from '../fact/Fact'
import PhraseMatch from './PhraseMatch'
import Corpus from '../Corpus'
import Word from '../Word'

export default class Phrase implements Fact {

    constructor(public id: string, public patterns: PhraseMatch[]) {
        this.id = id
        this.patterns = patterns

        if (!this.patterns.length || !this.patterns[0]) {
            throw new Error(`No pattern specified for phrase ${id}`)
        }
    }

    static fromString(id: string, str: string, corpus: Corpus) {

        return new Phrase(
            id,
            str.split(',').map((str) => 
                PhraseMatch.fromString(str.trim(), corpus)))

    }

    match(words: Word[]): Word[] {
        for (let i = 0; i < this.patterns.length; i++) {
            let match = this.patterns[i].match(words)

            if (match) {
                return match
            }
        }
    }

    toString() {
        return this.patterns.map((p) => p.toString()).join(', ')
    }

    getId() {
        return this.id
    }

    visitFacts(visitor: (Fact) => any) {
        visitor(this)
    }

}