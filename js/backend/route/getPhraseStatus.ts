import * as express from 'express'

import { PhraseStatus, STATUS_OPEN } from '../../shared/metadata/PhraseStatus'
import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let phraseId = req.params['id']

        if (!phraseId) {
            throw new Error('No phrase ID')
        }

        corpus.phraseHistory.getStatus(phraseId)
            .then((status: PhraseStatus) => {
                if (status) {
                    res.status(200).send(status)
                }
                else {
                    res.status(200).send({
                        status: STATUS_OPEN
                    })
                }
            })
            .catch((e) => {
                console.log(e)
                res.status(500).send(e)
            })
    }
}