import * as express from 'express'

import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let type = req.params.type

        if (type == 'all') {
            type = null
        }

        let author = req.params.author

        if (author == 'all') {
            author = null
        }

        corpus.sentenceHistory.getLatestEvents(type, author)
            .then((events) => {
                res.status(200).send(events)
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}