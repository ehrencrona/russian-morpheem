import Fact from '../../shared/fact/Fact'
import Phrase from '../../shared/phrase/Phrase'
import AbstractAnyWord from '../../shared/AbstractAnyWord'
import InflectedWord from '../../shared/InflectedWord'
import Sentence from '../../shared/Sentence'

export default function getGuideUrl(fact: Fact|Sentence, context?: InflectedWord) {
    let type = 'form'

    if (fact instanceof Sentence) {
        return `/sentence/${fact.id}` 
    }

    if (fact instanceof AbstractAnyWord) {
        type = 'word'
    }
    else if (fact instanceof Phrase) {
        type = 'phrase'
    }

    return `/${type}/${ encodeURI(fact.getId()) }${ context ? '?word=' + encodeURI(context.getId()) : '' }`
}