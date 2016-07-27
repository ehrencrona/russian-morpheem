import Fact from './fact/Fact'
import Words from './Words'
import Facts from './fact/Facts'
import Phrase from './phrase/Phrase'
import Phrases from './phrase/Phrases'
import Word from './Word'
import InflectedWord from './InflectedWord'
import htmlEscape from './util/htmlEscape'
import UnparsedWord from './UnparsedWord'

export type JsonFormat = (number | string | string[])[]

/**
 * A sentence is a list of Japanese words with an English translation. It can optionally require certain grammar facts.
 */
export default class Sentence {
    english: string = ''
    phrases: Phrase[] = []

    constructor(public words: Word[], public id: number, public author?: string) {
        this.words = words
        this.id = id
        this.author = author
    }

    equals(other: Sentence) {
        return this.words.length == other.words.length &&
            !this.words.find((word, index) => word.getId() != other.words[index].getId())
    }

    static fromJson(json: JsonFormat, phrases: Phrases, words: Words) {
        let data = {
            id: json[0],
            words: json[1],
            english: json[2],
            phrases: json[3],
            tags: json[4]
        }

        if (data.english == 'undefined') {
            delete data.english
        }

        let sentence =
            new Sentence(
                (data.words as string[]).map((wordId) => { 
                    let word = words.get(wordId)

                    if (!word) {
                        throw new Error(`Unknown word "${wordId}"`)
                    }

                    return word
                 }), data.id as number)
                .setEnglish(data.english)

        if (data.phrases) {    
            (data.phrases as string[]).forEach((phraseId) => 
                sentence.addPhrase(phrases.get(phraseId))
            )
        }

        return sentence        
    }
    
    toJson(): JsonFormat {
        return [
            this.id,
            this.words.map((word) => word.getId()),
            this.english,
            ( this.phrases ? this.phrases.map((fact) => fact.getId()) : undefined )
        ]
    }

    getId(): number {
        if (this.id === undefined) {
            throw new Error('No ID present.')
        }

        return this.id
    }

    setEnglish(en) {
        if (en !== 'undefined') {
            this.english = en
        }
        
        return this
    }

    en() {
        return this.english
    }

    jp() {
        var res = ''

        for (let word of this.words) {
            res += word.jp + ' '
        }

        return res
    }

    hasPhrase(phrase: Phrase) {
        return this.phrases.find((p) => p.getId() == phrase.getId())
    }
    
    addPhrase(phrase: Phrase) {
        if (!this.hasPhrase(phrase)) {
            this.phrases.push(phrase)
        }

        return this
    }

    removePhrase(phrase: Phrase) {        
        this.phrases = this.phrases.filter((p) => p != phrase)
    }

    visitFacts(visitor: (Fact) => any) {
        for (let word of this.words) {
            word.visitFacts(visitor)
        }

        this.phrases.forEach((phrase) => phrase.visitFacts(visitor))
    }

    innerToString(wordToString: (word: Word, first: boolean, index: number) => string) {
        let res = ''
        let capitalize = true 

        this.words.forEach((word, index) => {
            if (res.length && (word.jp.length > 1 || Words.PUNCTUATION.indexOf(word.jp) < 0)) {
                res += ' '
            }

            let wordString = wordToString(word, res.length == 0, index)

            if (capitalize) {
                wordString = wordString[0].toUpperCase() + wordString.substr(1)
            }

            res += wordString

            capitalize = Words.SENTENCE_ENDINGS.indexOf(word.jp) >= 0
        })

        if (this.words.length && Words.PUNCTUATION.indexOf(this.words[this.words.length-1].jp) < 0) {
            res += '.'
        }

        return res
    }

    toString() {
        return this.innerToString((word) => word.toString())
    }

    toUnambiguousHtml(words: Words) {
        return this.innerToString((word, first) => {
            if (word.jp == '—' && !first) {
                return '<br>—'
            }

            let result

            if (word instanceof InflectedWord) {
                result = word.toUnambiguousHtml(words)                
            }
            else {
                result = htmlEscape(word.toString())
            }

            return result
        })
    }

    toUnambiguousString(words: Words) {
        return this.innerToString((word) =>
            word.toUnambiguousString(words)                
        )
    }

    canAccept() {
        return this.words.length && !this.words.find((word) => word instanceof UnparsedWord)
    }
}
