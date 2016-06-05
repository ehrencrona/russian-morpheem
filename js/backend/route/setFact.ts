import * as express from 'express'
import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let fact = corpus.facts.get(req.params['id'])
        let index = parseInt(req.params['pos'])
        
        corpus.facts.move(fact, index)

        console.log('Moved ' + fact + ' to ' + index)

        res.status(200).send({})
    }
}