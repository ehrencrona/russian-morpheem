import * as express from 'express'

import { getLatestSentenceIds } from '../metadata/Metadata'
import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        getLatestSentenceIds()
            .then((sentenceIds: number[]) => {
                res.status(200).send(sentenceIds)
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}