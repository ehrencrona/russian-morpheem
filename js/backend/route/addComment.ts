import * as express from 'express'
import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

import { recordComment } from '../metadata/Metadata'
import { notifyComment } from '../notifySlack'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {

        let sentenceId = parseInt(req.params['id'])

        if (isNaN(sentenceId)) {
            throw new Error('No sentence ID')
        }

        let sentence = corpus.sentences.get(sentenceId)

        if (!sentence) {
            throw new Error('No such sentence')
        }

        let comment = req.body.text

        if (!comment) {
            throw new Error('No text provided.')
        }

        let author = getAuthor(req).name

        recordComment(comment, sentence, author)

        notifyComment(comment, sentence, author)

        res.status(200).send({})
    }
}
