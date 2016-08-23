import * as express from 'express'

import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        corpus.phraseHistory.getOpenPhrases()
            .then((ids: string[]) => {
                res.status(200).send(ids)
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}