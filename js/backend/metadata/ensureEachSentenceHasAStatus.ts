
import { getStatus, setStatus, recordEvent } from './Metadata'
import { STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

import Sentence from '../../shared/Sentence'

export default function ensureEachSentenceHasAStatus(sentence: Sentence) {

    getStatus(sentence.id)
    .then((status) => {

        if (!status || status.status == null) {
            setStatus(STATUS_SUBMITTED, sentence.id, sentence.author)
            recordEvent('import', sentence, sentence.author)
        }

    })
    .catch((e) => {
        console.log(e)
    })

}