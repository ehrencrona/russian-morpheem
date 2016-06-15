import * as express from 'express'

import { getLatestEvents, EVENT_CREATE } from '../metadata/Metadata'
import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        getLatestEvents(req.params.type, getAuthor(req).name)
            .then((sentenceIds: number[]) => {
                res.status(200).send(sentenceIds)
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}