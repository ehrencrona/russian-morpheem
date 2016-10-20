
import Sentence from './Sentence'
import AbstractAnyWord from './AbstractAnyWord'
import Words from './Words'

const PUNCTUATION = Words.PUNCTUATION

interface Translation {
    index: number
    string: string
}

export default function getWordTranslationInSentence(word: AbstractAnyWord, sentence: Sentence): Translation {
    let result: Translation = {
        string: word.getEnglish(),
        index: 0
    }

    let sentenceTranslation = sentence.en().toLowerCase()

    for (let i = 1; i < word.getTranslationCount(); i++) {
        // note that we are looking for the inflected word but then 
        // actually using the non-inflected

        let wordTranslation = word.getEnglish('', i)
        let index = sentenceTranslation.indexOf(wordTranslation.toLowerCase())
        let end = index + wordTranslation.length

        if ((index == 0 || PUNCTUATION.indexOf(sentenceTranslation[index]) >= 0) &&
            (end == wordTranslation.length || PUNCTUATION.indexOf(sentenceTranslation[end]) >= 0)) {
            result.string = word.getEnglish('', i)
            result.index = i
        }
    }

    return result
}
