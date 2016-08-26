
import Word from '../Word'
import Sentence from '../Sentence'
import Facts from '../fact/Facts'
import { CaseStudy } from './PhrasePattern'
import Match from './Match'
import { GrammaticalCase } from '../inflection/InflectionForms'

interface MatchContext {
    depth?: number
    words: Word[]
    sentence?: Sentence
    facts: Facts
    study?: CaseStudy
    overrideFormCase?: GrammaticalCase 
}

export default MatchContext