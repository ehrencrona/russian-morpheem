import * as express from 'express'

import Corpus from '../../shared/Corpus'
import Word from '../../shared/Word'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        corpus.sentences.remove(corpus.sentences.get(req.params['id']))

        res.status(200).send({ })
    }
}