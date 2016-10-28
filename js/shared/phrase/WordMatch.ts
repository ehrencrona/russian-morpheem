
import Word from '../Word'
import Facts from '../fact/Facts'
import Corpus from '../Corpus'
import { GrammaticalCase } from '../inflection/InflectionForms'
import MatchContext from './MatchContext'
import Match from './Match'
import { InflectionForm } from '../inflection/InflectionForms'

interface WordMatch {

    /* Returns number of words matched. */
    matches(context: MatchContext, wordPosition: number, matches: WordMatch[], 
        matchPosition: number): number|Match

    allowEmptyMatch(): boolean

    /* may be null */
    getForm(): InflectionForm

    /* must also implement CaseStudyMatch if true */
    isCaseStudy(): boolean

    setCorpus(corpus: Corpus)

}

export default WordMatch