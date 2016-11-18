import { NamedWordForm } from '../inflection/WordForm';
import Fact from '../../shared/fact/Fact'
import Phrase from '../../shared/phrase/Phrase'
import AbstractAnyWord from '../../shared/AbstractAnyWord'
import InflectedWord from '../../shared/InflectedWord'
import Sentence from '../../shared/Sentence'

export default function getGuideUrl(fact: Fact|Sentence, context?: InflectedWord) {
    if (fact instanceof Sentence) {
        return `/sentence/${fact.id}` 
    }

    let type = 'form'

    if (fact instanceof AbstractAnyWord) {
        type = 'word'
    }
    else if (fact instanceof Phrase) {
        type = 'phrase'
    }
    else if (fact instanceof NamedWordForm) {
        type = 'words'
    }

    return `/${type}/${ encodeURI(fact.getId()) }${ 
        context ? '?word=' + encodeURI(context.getWordFact().getId()) : '' }`
}