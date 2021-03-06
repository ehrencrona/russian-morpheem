
import Corpus from '../Corpus'

import { FORMS } from '../inflection/InflectionForms'
import WORD_FORMS from '../inflection/WordForms'

export default function allGuideFacts(corpus: Corpus) {
    return corpus.facts.facts
        .concat(Object.keys(WORD_FORMS).filter(f => !corpus.facts.get(f)).map(k => WORD_FORMS[k]))
        .concat(Object.keys(FORMS).filter(f => !corpus.facts.get(f) && !WORD_FORMS[f]).map(k => FORMS[k]))
}

export function getGuideFact(factId: string, corpus: Corpus) {
    return corpus.facts.get(factId) || WORD_FORMS[factId] || FORMS[factId]
}