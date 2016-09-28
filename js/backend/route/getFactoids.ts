import * as express from 'express'

import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        corpus.factoids.getAll()
            .then((factoids) => {
                res.status(200).send(factoids)
            })
    }
}