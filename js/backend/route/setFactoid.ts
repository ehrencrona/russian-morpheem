import * as express from 'express'

import Corpus from '../../shared/Corpus'
import { Factoid } from '../../shared/metadata/Factoids'
import getAuthor from '../getAuthor'
import Grammars from '../../shared/Grammars'

export default function(corpus: Corpus) {
    let grammars = new Grammars(corpus.inflections)

    return (req: express.Request, res: express.Response) => {
        let factId = req.params['id']

        if (!factId) {
            throw new Error('No fact ID')
        }

        let fact = corpus.facts.get(factId) || grammars.get(factId)

        if (!fact) {
            throw new Error(`Unknown fact "${factId}"`)
        }

        let factoid = req.body as Factoid

        let author = getAuthor(req).name
        
        corpus.factoids.getFactoidAsync(fact)
        .then(oldFactoid => {
            if (factoid.explanation &&
                Math.abs(oldFactoid.explanation.length - factoid.explanation.length) > 3) {
                console.log(`Factoid for ${factId} updated by ${author}: "${ factoid.explanation.replace(/\n/g, ' ') }"`)
            }

            corpus.factoids.setFactoid(factoid, fact)
                .then((events) => {
                    res.status(200).send({ ok: true })
                })
                .catch(e => {
                    res.status(500).send(e)
                    console.error(e.stack)
                })
        })
        .catch(e => {
            res.status(500).send(e)
            console.error(e.stack)
        })
    }
}