import Fact from '../../shared/fact/Fact'
import Phrase from '../../shared/phrase/Phrase'
import AbstractAnyWord from '../../shared/AbstractAnyWord'
import InflectedWord from '../../shared/InflectedWord'

export default function getGuideUrl(fact: Fact, context?: InflectedWord) {
    let type = 'form'

    if (fact instanceof AbstractAnyWord) {
        type = 'word'
    }
    else if (fact instanceof Phrase) {
        type = 'phrase'
    }

    return `/${type}/${ fact.getId()}${ context ? '?word=' + encodeURI(context.getId()) : '' }`
}