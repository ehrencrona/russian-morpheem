
import Word from '../Word'
import Sentence from '../Sentence'
import Facts from '../fact/Facts'
import { CaseStudy, Match } from './PhrasePattern'
import { GrammaticalCase } from '../inflection/InflectionForms'

interface MatchContext {
    words: Word[]
    sentence?: Sentence
    facts: Facts
    study?: CaseStudy
    overrideFormCase?: GrammaticalCase 
}

export default MatchContext