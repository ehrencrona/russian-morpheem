import * as express from 'express'

import exposures from '../../backend/study/BackendExposures'

import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let authorId = getAuthor(req).numericalId

        exposures.getProgress(authorId).then((progress) => {
            res.status(200).send(progress)
        })
        .catch((e) => {
            console.error(e.stack)
            res.status(500).send(e)
        })
    }
}