import * as express from 'express'

import { getEventsForSentence } from '../metadata/Metadata'
import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let sentenceId = parseInt(req.params['id'])

        if (isNaN(sentenceId)) {
            throw new Error('No sentence ID')
        }

        getEventsForSentence(sentenceId)
            .then((events) => {
                res.status(200).send(events)
            })
    }
}