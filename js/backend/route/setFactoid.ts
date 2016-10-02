import * as express from 'express'

import Corpus from '../../shared/Corpus'
import { Factoid } from '../../shared/metadata/Factoids'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let factId = req.params['id']

        if (!factId) {
            throw new Error('No fact ID')
        }

        let fact = corpus.facts.get(factId)

        if (!fact) {
            throw new Error(`Unknown fact "${factId}"`)
        }

        corpus.factoids.setFactoid(req.body as Factoid, fact)
            .then((events) => {
                res.status(200).send({ ok: true })
            })
    }
}