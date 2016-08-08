
import Word from '../Word'
import Facts from '../fact/Facts'
import Corpus from '../Corpus'
import { GrammaticalCase } from '../inflection/InflectionForms'

interface WordMatch {

    /* Returns number of words matched. */
    matches(words: Word[], wordPosition: number, matches: WordMatch[], 
        matchPosition: number): number

    allowEmptyMatch(): boolean

    /* must also implement CaseStudyMatch if true */
    isCaseStudy(): boolean

    setCorpus(corpus: Corpus)

}

export default WordMatch