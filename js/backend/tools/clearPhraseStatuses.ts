
import { STATUS_OPEN } from '../../shared/metadata/PhraseStatus'
import readCorpus from '../CorpusReader'

import Sentence from '../../shared/Sentence'
import Corpus from '../../shared/Corpus'

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    Promise.all(corpus.phrases.all().map((phrase) => {
        return corpus.phraseHistory.setStatus({ status: STATUS_OPEN }, phrase.id)
        .catch((e) => {
            console.log(e.stack)
        })
        .then(() => { console.log('updated ' + phrase.id)})
    }))
    .then(() => {
        console.log('done')
    })

})