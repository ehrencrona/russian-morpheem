
import Corpus from '../../shared/Corpus'
import Fact from '../../shared/fact/Fact'
import Word from '../../shared/Word'
import { ExternalSentence } from './ExternalSentence'

export type ParsedWord = (string | Word[])

export function parseSentenceToWords(sentence: ExternalSentence, corpus: Corpus): ParsedWord[] {
    let words = tokenize(sentence.text)

    return words.map((word) =>
        parseWord(word, corpus))
}

export function parseWord(word: string, corpus: Corpus): ParsedWord {
    let exactMatch = corpus.words.wordsByString[word] || corpus.words.wordsByString[word.toLowerCase()]

    if (exactMatch) {
        return [ exactMatch ]
    }
    else {
        let wordInstance = corpus.words.ambiguousForms[word] ||
            corpus.words.ambiguousForms[word.toLowerCase()]

        if (wordInstance) {
            return wordInstance
        } 
        else {
            return word
        }
    }
}

function tokenize(sentence) {
    if (!sentence) {
        return []
    }

    var words = []
    var word = ''
    let isQuoted = false

    function foundWord(word) {
        if (word.length > 0) {
            // replace minus as a word with semi-long dash
            if (word == '-') {
                word = '–'
            }

            if (word == '"') {
                word = (isQuoted ? '»' : '«')

                isQuoted = !isQuoted
            }

            words.push(word)
        }
    }

    for (var i = 0; i < sentence.length; i++) {
        var ch = sentence[i]

        if (ch == ' ') {
            foundWord(word)
            word = ''
        }
        else if (!isWordCharacter(ch) && ch !== "'" && !(ch >= '0' && ch <= '9')) {
            foundWord(word)
            foundWord(ch)
            word = ''
        }
        else {
            word += ch
        }
    }

    foundWord(word)

    return words
}

function isWordCharacter(ch) {
    var res =
        (ch >= 'A' && ch <= 'Z') ||
        (ch >= 'a' && ch <= 'z') ||
        (ch >= 'Ѐ' && ch <= 'ӿ') ||
        (ch >= 'À' && ch <= 'ö') ||
        (ch >= 'Ā' && ch <= 'ſ') ||
        ch == '-';

    return res
}
