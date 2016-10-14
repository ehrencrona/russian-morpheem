import * as express from 'express'

import Corpus from '../../shared/Corpus'
import { SerializedStudyPlan } from '../../shared/study/StudyPlan'
import { fetchPlan } from '../study/BackendStudyPlan'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {

        let factIds = req.body.facts as string[]

        let facts = factIds.map(id => corpus.facts.get(id)).filter(f => !!f)

        fetchPlan(getAuthor(req).numericalId, corpus)
            .then(plan => {
                plan.queueFacts(facts)

                res.status(200).send({ ok: true })
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}