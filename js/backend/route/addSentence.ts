import * as express from 'express'

import Sentence from '../../shared/Sentence'
import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

import { STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'
import { storeSuccess } from '../listenForChanges'
import { notify, Channel } from '../notifySlack'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        if (!storeSuccess) {
            res.status(304).send('Server cannot store data.');
            console.error('Refused storing due to error state.')
            return
        }

        let sentence = Sentence.fromJson(req.body, corpus.phrases, corpus.words)

        sentence.author = getAuthor(req).name
        sentence.id = null

        corpus.sentences.add(sentence)
        .then((sentence) => {
            console.log(sentence.author + ' added ' + sentence + ' (' + sentence.id + ')')

            corpus.sentenceHistory.recordCreate(sentence, sentence.author)
            corpus.sentenceHistory.setStatus({ status: STATUS_SUBMITTED, author: sentence.author }, sentence.id)

            res.status(200).send({ id: sentence.id })
        })
        .catch((e) => res.status(500).send(e.toString()))
    }
}