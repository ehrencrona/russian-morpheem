
import { indexSentencesByFact, FactSentenceIndex } from  '../../shared/indexSentencesByFact'

import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'

interface FactScore {
    fact: InflectionFact,
    score: number
}

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    let index = indexSentencesByFact(corpus.sentences, corpus.facts, 10)

    let scores = corpus.facts.facts
    .filter((fact) => fact instanceof InflectionFact)
    .filter((fact: InflectionFact) => fact.inflection.pos == 'n' || fact.inflection.pos == 'v')
    .map((fact: InflectionFact) => {

        let factIndex: FactSentenceIndex = index[fact.getId()]

        let score = {
            fact: fact,
            score: 0
        }

        if (factIndex) {
            score.score = factIndex.easy + factIndex.hard + factIndex.ok
        }

        return score
    })
    .sort((s1, s2) => s2.score - s1.score)

    console.log(scores.map((s) => s.fact.getId()))
})