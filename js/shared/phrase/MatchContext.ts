import Phrase from './Phrase';

import Word from '../Word'
import Sentence from '../Sentence'
import Facts from '../fact/Facts'
import { CaseStudy } from './PhrasePattern'
import Match from './Match'
import { GrammarCase } from '../inflection/Dimensions'

interface MatchContext {
    depth?: number
    words: Word[]
    sentence?: Sentence
    facts: Facts
    parent?: MatchContext
    phrase?: Phrase
    study?: CaseStudy
    overrideFormCase?: GrammarCase
}

export default MatchContext