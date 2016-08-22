
import Word from '../Word'
import Facts from '../fact/Facts'
import { CaseStudy, Match } from './PhrasePattern'
import { GrammaticalCase } from '../inflection/InflectionForms'

interface MatchContext {
    words: Word[]
    facts: Facts
    study?: CaseStudy
    overrideFormCase?: GrammaticalCase 
}

export default MatchContext