
import Word from './Word'
import Words from './Words'
import htmlEscape from './util/htmlEscape'

export default class UnparsedWord extends Word {

    getId() {
        return '"' + this.jp +  '"'
    }

    toUnambiguousString(words: Words) {
        return this.toString()
    }

    toUnambiguousHtml(words: Words) {
        return '"' + htmlEscape(this.jp) + '"'
    } 

    getDisambiguation(words: Words) {
        return
    }

    toString() {
        return '"' + this.jp +  '"'
    }
}