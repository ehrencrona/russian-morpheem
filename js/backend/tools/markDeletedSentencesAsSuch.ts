
import { indexSentencesByFact, FactSentenceIndex } from  '../../shared/IndexSentencesByFact'

import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'
import BackendSentenceHistory from '../metadata/BackendSentenceHistory'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    let history = corpus.sentenceHistory as BackendSentenceHistory

    history.markDeletedSentencesAsSuch(corpus.sentences)
    .then(() => {
        console.log('Done')

        process.exit(0)
    })
})