
import { indexSentencesByFact, FactSentenceIndex } from  '../../shared/IndexSentencesByFact'

import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

import UnstudiedWord from '../../shared/UnstudiedWord'
import InflectableWord from '../../shared/InflectableWord'

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    corpus.facts.facts.forEach((fact) => {

        if (fact instanceof UnstudiedWord || fact instanceof InflectableWord) {

            console.log(fact.getId() + ' / ' + fact.getEnglish())

        }

    })

})