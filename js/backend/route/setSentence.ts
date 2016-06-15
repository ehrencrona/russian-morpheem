import * as express from 'express'

import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import getAuthor from '../getAuthor'
import { recordEdit } from '../metadata/Metadata'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        try {
            let sentence = Sentence.fromJson(req.body, corpus.facts, corpus.words)

            if (sentence.id != req.params['id']) {
                throw new Error('Inconsistent ID.');
            }

            corpus.sentences.store(sentence)

            console.log('Stored ' + sentence + ' (' + sentence.id + ')')

            recordEdit(sentence, getAuthor(req).name)

            res.status(200).send({})
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    }
}