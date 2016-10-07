
import InflectionFact from './InflectionFact'
import InflectedWord from '../InflectedWord'
import InflectableWord from '../InflectableWord'
import Corpus from '../Corpus'
import Fact from '../fact/Fact'

export default function findExamplesOfInflection(fact: InflectionFact, corpus: Corpus, maxCount: number, isHard: (fact: Fact, index: number) => boolean) {
    let inflectionIds = new Set()

    let inflection = fact.inflection
    let form = fact.form

    corpus.inflections.inflections.forEach((inflection) => {
        if (inflection.pos == fact.inflection.pos &&
            inflection.getInflectionId(fact.form) == fact.inflection.id) {
            inflectionIds.add(inflection.id)
        }
    })

    let easy: InflectedWord[] = [], hard: InflectedWord[] = []
    let more = false
    let foundCount = 0

    let facts = corpus.facts.facts

    for (let i = 0; i < facts.length && foundCount <= maxCount; i++) {
        let fact = facts[i]
        
        if (fact instanceof InflectableWord && 
            inflectionIds.has(fact.inflection.id)) {
            
            if (foundCount == maxCount) {
                more = true
            }
            else {
                (isHard(fact, i) ? hard : easy).push(fact.inflect(form))
            }

            foundCount++
        }
    }

    return { easy: easy, hard: hard, more: more }
}