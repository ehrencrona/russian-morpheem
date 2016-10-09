import * as express from 'express'

import Corpus from '../../shared/Corpus'
import { SerializedStudyPlan } from '../../shared/study/StudyPlan'
import { fetchPlan } from '../study/BackendStudyPlan'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {

        let factId = req.body.fact as string

        let fact = corpus.facts.get(factId)

        fetchPlan(getAuthor(req).numericalId, corpus)
            .then(plan => {
                plan.queueFact(fact)

                res.status(200).send({ ok: true })
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}