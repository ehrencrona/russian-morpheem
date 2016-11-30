import Phrase from './Phrase';

import Word from '../Word'
import Sentence from '../Sentence'
import Facts from '../fact/Facts'
import { CaseStudy } from './PhrasePattern'
import Match from './Match'
import { GrammarCase } from '../inflection/Dimensions'

export interface MatchContext {
    depth?: number
    words: Word[]
    facts: Facts
    overrideFormCase?: GrammarCase
    sentence?: Sentence
    study?: CaseStudy
    debug?: (message: string, position: DebugPosition) => void
}

export enum DebugPosition {
    START, END
}

export default MatchContext