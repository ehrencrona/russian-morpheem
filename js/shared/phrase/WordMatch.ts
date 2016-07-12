
import Word from '../Word'
import Facts from '../fact/Facts'

interface WordMatch {

    /* Returns number of words matched. */
    matches(word: Word[], facts: Facts): number

}

export default WordMatch