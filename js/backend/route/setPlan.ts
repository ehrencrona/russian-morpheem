import * as express from 'express'

import Corpus from '../../shared/Corpus'
import { SerializedStudyPlan } from '../../shared/study/StudyPlan'
import { storePlan } from '../study/BackendStudyPlan'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {

        let studyPlan = req.body as SerializedStudyPlan

        storePlan(studyPlan, getAuthor(req).numericalId, corpus)
            .then(done => {
                res.status(200).send({ ok: true })
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}