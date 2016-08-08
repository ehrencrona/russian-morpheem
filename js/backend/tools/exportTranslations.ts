
import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

import Word from '../../shared/Word'
import InflectableWord from '../../shared/InflectableWord'

const CLASSES = 4

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    corpus.facts.facts.forEach((fact, index) => {

        if (index > 300 && (fact instanceof Word || fact instanceof InflectableWord)) {
            if (fact.getEnglish().indexOf(',') >= 0)
                console.log(fact.getId() + ' ' + fact.getEnglish())

        }

    })

})