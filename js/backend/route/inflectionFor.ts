import { POS_BY_NAME } from '../../shared/inflection/InflectionForms';
import * as express from 'express';

import Corpus from '../../shared/Corpus'
import InflectableWord from '../../shared/InflectableWord'
import getInflections from '../inflection/InflectionDatabase'
import { generateInflection } from '../../shared/GenerateInflection'
import NoSuchWordError from '../../shared/NoSuchWordError'

import { createClient } from 'node-redis'

let client = createClient()

client.on('error', function (err) {
    console.log('Error ' + err);
})

function areAllIdentical(forms: {[ form: string ]: string}) {
    let formsArray = Object.keys(forms).map((form) => forms[form])
    
    if (formsArray.length < 2) {
        return true
    }
    
    return !formsArray.find((inflection) => inflection != formsArray[0])
}

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

            if (areAllIdentical(forms)) {
                res.status(200).send({
                    inflected: false
                })
                
                return
            }

            let generated = generateInflection(forms, POS_BY_NAME[gotInflections.pos], corpus.lang, corpus.inflections)
            let inflection = generated.inflection

            if (generated.isNew) {
                corpus.inflections.add(inflection)
            }

            res.status(200).send({
                isNew: generated.isNew,
                id: generated.inflection.id,
                inflection: generated.inflection.toJson(),
                inflected: true,
                stem: generated.stem    
            })
        })
        .catch((e) => {
            console.log(e.stack)
            
            res.status(500).send({})
        })
    }
}

