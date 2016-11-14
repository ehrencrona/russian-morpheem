
import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

import InflectableWord from '../../shared/InflectableWord'
import Phrase from '../../shared/phrase/Phrase'
import { ENGLISH_FORMS_BY_POS } from '../../shared/inflection/InflectionForms'

const CLASSES = 4


readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    corpus.facts.facts.forEach((fact) => {
        if (fact instanceof InflectableWord) {
            console.log(fact.toText()) 
        }
    })
})

console.log('done')
    
