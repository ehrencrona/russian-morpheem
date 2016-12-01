import { debug } from 'util';

import Sentence from './Sentence'
import AnyWord from './AnyWord'
import { PUNCTUATION } from './Punctuation'

const WORD_DELIMITER = ' ' + PUNCTUATION

interface TranslationFound {
    index: number
    string: string
}

export default function getWordTranslationInSentence(
        word: AnyWord, sentenceTranslation: string, nextWord?: AnyWord): string {
    let result: string

    sentenceTranslation = sentenceTranslation.toLowerCase()

    if (word.getTranslationCount() > 1) {
        let matches: TranslationFound[] = []
        let wordTranslations = word.getAllTranslations()

        wordTranslations.forEach(wordTranslation => {
            let index = -1
            
            do {
                index = sentenceTranslation.indexOf(wordTranslation.toLowerCase(), index + 1)
                
                if (index >= 0) {
                    let end = index + wordTranslation.length

                    if ((index == 0 || isWordDelimiter(sentenceTranslation[index-1])) &&
                        (end == wordTranslation.length || isWordDelimiter(sentenceTranslation[end]))) {
                        matches.push({
                            string: wordTranslation,
                            index: index
                        })
                    }
                }
            }
            while (index >= 0)
        })

        if (matches.length > 1 && nextWord) {
            let nextIndex

            nextWord.getAllTranslations().find(nextTranslation => {
                nextIndex = sentenceTranslation.indexOf(nextTranslation)

                return nextIndex >= 0
            })

            // pick the last match that is still before the next word
            if (nextIndex > 0) {
                let best: TranslationFound

                matches.forEach(m => {
                    if (m.index < nextIndex &&
                        (!best || best.index < m.index)) {
                        best = m
                    }
                })

                result = best.string
            }
        }

        if (!result) {
            if (matches.length) {
                result = matches[0].string
            }
            else {                
                console.error('Found none of ' + wordTranslations.map(w => `"${w}"`).join(' ') + 
                    ' in "' + sentenceTranslation + '".')
            }
        }
    }
    
    if (!result) {
        result = word.getEnglish()
    }

    return result
}

function isWordDelimiter(char: string) {
    return WORD_DELIMITER.indexOf(char) >= 0
}