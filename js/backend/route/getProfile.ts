import * as express from 'express'

import Corpus from '../../shared/Corpus'
import { fetchPlan } from '../study/BackendStudyPlan'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {

        fetchPlan(getAuthor(req).numericalId, corpus)
            .then(studyPlan => {
                res.status(200).send(studyPlan.serialize())
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })

    }
}