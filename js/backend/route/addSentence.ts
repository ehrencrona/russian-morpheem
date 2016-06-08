import * as express from 'express'

import Sentence from '../../shared/Sentence'
import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

import { recordCreate, setStatus } from '../metadata/Metadata'
import { STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let sentence = Sentence.fromJson(req.body, corpus.facts, corpus.words)
        sentence.author = getAuthor(req)

        sentence.id = null

        corpus.sentences.add(sentence)

        console.log('Added ' + sentence + ' (' + sentence.id + ')')
        
        recordCreate(sentence, sentence.author)
        setStatus(STATUS_SUBMITTED, sentence.id, sentence.author)

        res.status(200).send({ id: sentence.id })
    }
}