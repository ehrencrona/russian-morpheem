
import { indexSentencesByFact, FactSentences } from  '../../shared/SentencesByFactIndex'

import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

interface FactScore {
    fact: InflectionFact,
    score: number
}

const LOWEST_FACT = 300

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    let index = indexSentencesByFact(corpus.sentences, corpus.facts, 10)

    let scores = corpus.facts.facts
    .filter((fact) => fact instanceof InflectionFact)
    .filter((fact: InflectionFact) => fact.inflection.pos == 'n' || fact.inflection.pos == 'v' || fact.inflection.pos == 'adj')
    .filter((fact: InflectionFact) => corpus.facts.indexOf(fact) > LOWEST_FACT)
    .map((fact: InflectionFact) => {

        let factIndex: FactSentences = index[fact.getId()]

        let score = {
            fact: fact,
            score: 0
        }

        if (factIndex) {
            score.score = factIndex.count
        }

        return score
    })
    .sort((s1, s2) => s2.score - s1.score)

    console.log(scores.map((s) => s.fact.getId()))

    let facts = scores.map((score) => score.fact)

    facts.forEach((fact) => {
        corpus.facts.remove(fact)
    })

    facts.forEach((fact, index) => {
        corpus.facts.add(fact)

        corpus.facts.move(fact, LOWEST_FACT + index)
    })

    let corpusDir = getCorpusDir('ru')
    
    writeFactFile(corpusDir + '/facts.txt', corpus.facts)
    .catch((e) => console.error(e.stack))

    console.log('done')

})