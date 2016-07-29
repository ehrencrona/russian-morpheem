import * as express from 'express'

import { SentenceStatusResponse } from '../../shared/metadata/SentenceHistory'
import { SentenceStatus } from '../../shared/metadata/SentenceStatus'
import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let sentenceId = parseInt(req.params['id'])

        if (isNaN(sentenceId)) {
            throw new Error('No sentence ID')
        }

        corpus.sentenceHistory.getStatus(sentenceId)
            .then((status: SentenceStatusResponse) => {
                if (status) {
                    res.status(200).send({
                        canAccept: status.canAccept && getAuthor(req).name != status.status.author,
                        status: status.status
                    })
                }
                else {
                    res.status(404).send({})
                }
            })
            .catch((e) => {
                console.log(e)
                res.status(500).send(e)
            })
    }
}