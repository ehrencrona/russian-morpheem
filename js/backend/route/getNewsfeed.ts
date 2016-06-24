import * as express from 'express'

import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        corpus.sentenceHistory.getNewsfeed(getAuthor(req).name)
            .then((events) => {
                res.status(200).send(events)
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}