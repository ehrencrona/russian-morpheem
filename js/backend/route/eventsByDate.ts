import * as express from 'express'
import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        
        corpus.sentenceHistory.getEventsByDate(req.params.eventType)
            .then((data) => res.status(200).send(data))
            .catch((e) => {
                console.log(e.stack)

                res.status(500).send(e)
            })

    }
}