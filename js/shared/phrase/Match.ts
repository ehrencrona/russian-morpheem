import Phrase from './Phrase'
import PhrasePattern from './PhrasePattern'
import WordMatch from './WordMatch'
import Word from '../Word'
import Sentence from '../Sentence'

export interface Match {
    words: WordMatched[]
    pattern: PhrasePattern
    phrase?: Phrase
    sentence: Sentence
}

export interface WordMatched {
    wordMatch: WordMatch
    word: Word
    index: number
    /* only available on PhraseMatches */
    childMatch?: Match
}

export default Match;