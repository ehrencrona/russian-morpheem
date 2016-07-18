
import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

import UnstudiedWord from '../../shared/UnstudiedWord'
import InflectableWord from '../../shared/InflectableWord'

const CLASSES = 4

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    corpus.facts.facts.forEach((fact, index) => {

        if (index > 300 && (fact instanceof UnstudiedWord || fact instanceof InflectableWord)) {

            console.log(fact.getId() + ' / ' + Math.floor(CLASSES * (index - 300) / (corpus.facts.facts.length - 300)))

        }

    })

})