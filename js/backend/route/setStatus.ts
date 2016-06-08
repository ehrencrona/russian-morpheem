import * as express from 'express'

import { setStatus, recordEvent } from '../metadata/Metadata'
import { SentenceStatus, STATUS_ACCEPTED } from '../../shared/metadata/SentenceStatus'
import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let sentenceId = parseInt(req.params['id'])

        if (isNaN(sentenceId)) {
            throw new Error('No sentence ID')
        }

        let status = parseInt(req.body.status) 

        if (isNaN(status)) {
            throw new Error('No status')
        }

        let sentence = corpus.sentences.get(sentenceId)

        if (!sentence) {
            throw new Error('Unknown sentence')
        }

        if (status == STATUS_ACCEPTED) {
            setStatus(status, sentenceId)

            recordEvent('accepted', sentence, getAuthor(req))

            res.status(200).send({ status: status })
        }
        else {
            throw new Error('Unknown status.')
        }
    }
}