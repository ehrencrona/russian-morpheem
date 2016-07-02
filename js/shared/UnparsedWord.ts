
import UnstudiedWord from './UnstudiedWord'
import Words from './Words'

export default class UnparsedWord extends UnstudiedWord {

    getId() {
        return '"' + this.jp +  '"'
    }

    toUnambiguousString(words: Words) {
        return this.toString()
    }

    toString() {
        return '"' + this.jp +  '"'
    }
}