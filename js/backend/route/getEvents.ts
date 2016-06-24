import * as express from 'express'

import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let sentenceId = parseInt(req.params['id'])

        if (isNaN(sentenceId)) {
            throw new Error('No sentence ID')
        }

        corpus.sentenceHistory.getEventsForSentence(sentenceId)
            .then((events) => {
                res.status(200).send(events)
            })
    }
}