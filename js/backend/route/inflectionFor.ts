import * as express from 'express'

import Corpus from '../../shared/Corpus'
import InflectableWord from '../../shared/InflectableWord'
import getInflections from '../InflectionDatabase'
import { generateInflection } from '../../shared/FindBestInflection'
import NoSuchWordError from '../../shared/NoSuchWordError'

import { createClient } from 'node-redis'

let client = createClient()

client.on('error', function (err) {
    console.log('Error ' + err);
})

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let wordString = req.params['word']

        if (!wordString) {
            throw new Error('No word sent')
        }

        getInflections(wordString, client)
        .catch((e) => {
            if (e instanceof NoSuchWordError) {
                res.status(404).send({
                    error: 'unknown'
                })
            }
            else {
                console.error(e.stack)
                res.status(500).send(e)
            }
        })
        .then((gotInflections) => {
            // caught above
            if (!gotInflections) {
                return
            }

            let forms = gotInflections.forms

            let generated = generateInflection(forms, gotInflections.pos, corpus.lang, corpus.inflections)
            let inflection = generated.inflection

            if (generated.isNew) {
                corpus.inflections.add(inflection)
            }

            res.status(200).send({
                isNew: generated.isNew,
                id: generated.inflection.id,
                inflection: generated.inflection.toJson(),
                stem: generated.stem    
            })
        })
        .catch((e) => {
            console.log(e.stack)
            
            res.status(500).send({})
        })
    }
}

