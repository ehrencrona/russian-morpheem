import * as express from 'express'

import { getLatestEvents } from '../metadata/Metadata'
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

        getLatestEvents(type, author)
            .then((sentenceIds: number[]) => {
                res.status(200).send(sentenceIds)
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}