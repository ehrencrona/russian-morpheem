
import Corpus from '../../../shared/Corpus'

import InflectableWord from '../../../shared/InflectableWord'
import InflectedWord from '../../../shared/InflectedWord'
import Fact from '../../../shared/fact/Fact'
import { Knowledge } from '../../../shared/study/Exposure'

import Inflection from '../../../shared/inflection/Inflection'
import InflectionFact from '../../../shared/inflection/InflectionFact'
import NaiveKnowledge from '../../../shared/study/NaiveKnowledge'

export default function getExamplesUsingInflection(form: string, inflection: Inflection, 
        corpus: Corpus, knowledge: NaiveKnowledge, excludeWord?: InflectedWord, count?: number) {
    count = count || 99;

    let inflectionIds = new Set()

    let inflectionId = inflection.getInflectionId(form) 

    corpus.inflections.inflections.forEach((potentialChild) => {
        if (potentialChild.pos == inflection.pos &&
            potentialChild.getInflectionId(form) == inflectionId) {
            inflectionIds.add(potentialChild.id)
        }
    })

    let known: InflectableWord[] = []
    let unknown: InflectableWord[] = []

    let foundByStem = new Set<string>()

    let facts = corpus.facts.facts

    for (let i = 0; i < facts.length; i++) {
        let fact = facts[i]
        
        if (fact instanceof InflectableWord && 
            !!fact.inflect(form) &&
            (!excludeWord || fact.inflect(form).jp != excludeWord.jp) &&
            !foundByStem.has(fact.toText()) && 
            inflectionIds.has(fact.inflection.id)) {
            let list: InflectableWord[]

            foundByStem.add(fact.toText())

            let factKnowledge = knowledge.getKnowledge(fact)

            if (factKnowledge == Knowledge.KNEW) {
                known.push(fact)

                if (known.length == count) {
                    break
                }
            }
            else {
                unknown.push(fact)
            }
        }
    }

    return known.concat(unknown).slice(0, count)
}
