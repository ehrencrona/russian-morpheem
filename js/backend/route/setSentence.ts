import * as express from 'express'

import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        try {
            let sentence = Sentence.fromJson(req.body, corpus.facts, corpus.words)

            if (sentence.id != req.params['id']) {
                throw new Error('Inconsistent ID.');
            }

            corpus.sentences.store(sentence)

            let author = getAuthor(req).name

            console.log('Stored ' + sentence + ' (' + sentence.id + ') by ' + author)

            corpus.sentenceHistory.recordEdit(sentence, author)

            res.status(200).send({})
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    }
}