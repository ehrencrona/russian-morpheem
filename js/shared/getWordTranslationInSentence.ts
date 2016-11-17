
import Sentence from './Sentence'
import AnyWord from './AnyWord'
import { PUNCTUATION } from './Punctuation'

const WORD_DELIMITER = ' ' + PUNCTUATION

interface Translation {
    index: number
    string: string
}

export default function getWordTranslationInSentence(word: AnyWord, sentence: Sentence): Translation {
    let result: Translation = {
        string: word.getEnglish(),
        index: 0
    }

    let sentenceTranslation = sentence.en().toLowerCase()

    for (let i = 1; i < word.getTranslationCount(); i++) {
        let wordTranslation = word.getEnglish('', i)
        let index = sentenceTranslation.indexOf(wordTranslation.toLowerCase())
        let end = index + wordTranslation.length

        if ((index == 0 || WORD_DELIMITER.indexOf(sentenceTranslation[index-1]) >= 0) &&
            (end == wordTranslation.length || WORD_DELIMITER.indexOf(sentenceTranslation[end]) >= 0)) {
            result.string = wordTranslation
            result.index = i
        }
    }

    return result
}
