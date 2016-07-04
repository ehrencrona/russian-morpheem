import * as express from 'express'

import exposures from '../../backend/study/BackendExposures'
import Exposure from '../../shared/study/Exposure'

import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let authorId = getAuthor(req).numericalId

        let exposuresToStore = req.body as Exposure[]

        exposuresToStore.forEach((exposure) => exposure.user = authorId)

        exposures.registerExposures(exposuresToStore).then(() => {
            res.status(200).send(exposures)
        })
        .catch((e) => {
            console.error(e.stack)
            res.status(500).send(e)
        })
    }
}