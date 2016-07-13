import * as express from 'express'

import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
import getAuthor from '../getAuthor'

import { storeSuccess } from '../listenForChanges'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        if (!storeSuccess) {
            res.status(304).send('Server cannot store data.');
            console.error('Refused storing due to error state.')
            return
        }

        try {
            let phrase = Phrase.fromJson(req.body, corpus.words)

            if (phrase.id != req.params['id']) {
                throw new Error('Inconsistent ID.');
            }

            let author = getAuthor(req).name

            let previous = corpus.phrases.get(phrase.id)

            if (previous) {
                if (!phrase.description) {
                    phrase.description = previous.description
                }

                if (!phrase.patterns.length) {
                    phrase.patterns = previous.patterns
                }

                if (phrase.description != previous.description) {
                    console.log(`${author} updated phrase ${phrase.id} description to "${phrase.description}"`)
                }

                if (phrase.toString() != previous.toString()) {
                    console.log(`${author} updated phrase ${phrase.id} pattern to ${phrase.toString()}.`)
                }
            }
            else {
                console.log(`${author} created phrase ${phrase.id} with pattern ${phrase.toString()}.`)

                corpus.facts.add(phrase)
            }

            corpus.phrases.store(phrase)

            res.status(200).send({})
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    }
}