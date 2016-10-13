import * as express from 'express'

import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        corpus.topics.getAll()
            .then((topics) => {
                res.status(200).send(topics.map(t => 
                    t.serialize()))
            })
    }
}