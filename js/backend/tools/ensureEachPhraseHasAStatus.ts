
import { STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

import BackendSentenceHistory from '../../backend/metadata/BackendSentenceHistory'
import Sentence from '../../shared/Sentence'
import Corpus from '../../shared/Corpus'

export default function ensureEachPhraseHasAStatus(sentence: Sentence, corpus: Corpus) {

    corpus.sentenceHistory.getStatus(sentence.id)
    .then((status) => {

        if (!status || status.status == null) {
            corpus.sentenceHistory.setStatus({ status: STATUS_SUBMITTED, author: sentence.author }, sentence.id)
            (corpus.sentenceHistory as BackendSentenceHistory).recordEvent('import', sentence, sentence.author)
        }

    })
    .catch((e) => {
        console.log(e.stack)
    })

}