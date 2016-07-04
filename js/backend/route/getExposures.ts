import * as express from 'express'

import exposures from '../../backend/study/BackendExposures'

import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let authorId = getAuthor(req).numericalId

        exposures.getExposures(authorId).then((exposures) => {
            res.status(200).send(exposures)
        })
        .catch((e) => {
            console.error(e.stack)
            res.status(500).send(e)
        })
    }
}