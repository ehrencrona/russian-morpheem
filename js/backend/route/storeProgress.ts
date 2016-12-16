import Progress from '../../shared/study/Progress';
import * as express from 'express';

import exposures from '../../backend/study/BackendExposures'
import Exposure from '../../shared/study/Exposure'
import { Knowledge } from '../../shared/study/Exposure'

import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let author = getAuthor(req)
        let authorId = author.numericalId

        let progressToStore = req.body as Progress

        progressToStore.date = new Date(req.body.date)

        exposures.storeProgress(progressToStore, authorId).then(() => {
            res.status(200).send({})
        })
        .catch((e) => {
            console.error(e.stack)
            res.status(500).send(e)
        })
    }
}