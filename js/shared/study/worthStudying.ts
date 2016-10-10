import Fact from '../fact/Fact'
import Word from '../Word'
import InflectionFact from '../inflection/InflectionFact'
import InflectableWord from '../InflectableWord'

export default function isWorthStudying(fact: Fact) {
    if (fact instanceof InflectionFact) {
        return fact.form != fact.inflection.defaultForm
    }
    else if (fact instanceof Word || fact instanceof InflectableWord) {
        return fact.studied
    }
    else {
        return true
    }
}
