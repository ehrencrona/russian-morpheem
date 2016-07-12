
import Word from '../Word'

interface WordMatch {

    /* Returns number of words matched. */
    matches(word: Word[]): number

}

export default WordMatch