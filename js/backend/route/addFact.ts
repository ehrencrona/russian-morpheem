import * as express from 'express'
import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let components = req.params['id'].split('@')
        
        let fact = corpus.inflections.get(components[0]).getFact(components[1])

        corpus.facts.add(fact)
        
        console.log('Added ' + fact + '.')

        res.status(200).send({})
    }
}