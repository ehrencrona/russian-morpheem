
import Word from '../Word'
import Facts from '../fact/Facts'

interface WordMatch {

    /* Returns number of words matched. */
    matches(words: Word[], wordPosition: number, matches: WordMatch[], 
        matchPosition: number, facts: Facts): number

    allowEmptyMatch(): boolean
}

export default WordMatch