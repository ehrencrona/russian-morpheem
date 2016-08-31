import * as express from 'express'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import getAuthor from '../getAuthor'
import { exists } from 'fs'
import { resolve } from 'path'
import { STATUS_ACCEPTED } from '../../shared/metadata/SentenceStatus'

export function getFileName(sentence: Sentence) {
    return sentence.id + '-' + sentence.toString().toLowerCase().replace(/ /g, '-')
        .replace(/[^а-яА-Я]/g, '-')
        .replace(/-+/g, '-')
        .replace(/-$/, '')
        .replace(/^-/, '')
}

export function getPath(fileName: string) {
    return __dirname + '/../../../audio/' + fileName + '.wav'
}

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let sentenceId = parseInt(req.params['id'])

        let sentence = corpus.sentences.get(sentenceId)

        if (!sentence) {
            res.status(404).send( {} )
            return
        }

        let filename = getFileName(sentence)

        if (filename.indexOf('.') >= 0 || filename.indexOf('/') >= 0) {
            return res.status(401).send({})
        }

        filename = resolve(getPath(filename))

        exists(filename, function(exists) {
            res.sendFile(filename, { lastModified: false })
        })
    }
}
