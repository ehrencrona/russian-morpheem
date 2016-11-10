import Corpus from '../Corpus'
import { FORMS } from '../inflection/InflectionForms'

export default function allGuideFacts(corpus: Corpus) {
    return corpus.facts.facts
        .concat(Object.keys(FORMS).filter(f => !corpus.facts.get(f)).map(k => FORMS[k]))
}