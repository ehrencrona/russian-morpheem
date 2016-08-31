import * as express from 'express'
import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
import getAuthor from '../getAuthor'
import { createWriteStream } from 'fs'
import { STATUS_ACCEPTED } from '../../shared/metadata/SentenceStatus'

import { getFileName, getPath } from './getAudio'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        var sentenceId = parseInt(req.params['id'])

        let sentence = corpus.sentences.get(sentenceId)

        if (!sentence) {
            console.warn(`Dont know sentence ${sentenceId} to record`)

            res.status(404).send( {} )
            return
        }

        let foo: any = req

        let author = getAuthor(req).name

console.log('set audio')

        foo.busboy.on('file', function (fieldname, file, filename) {
console.log('stored file ' + getPath(getFileName(sentence)))
            var fstream = createWriteStream(getPath(getFileName(sentence)))

            file.pipe(fstream)

            fstream.on('close', function () {
                res.status(200).send( {} )
            })

            corpus.sentenceHistory.recordRecord(sentence, author)
            corpus.sentenceHistory.setStatus(
                { status: STATUS_ACCEPTED, recorded: new Date() },
                sentence.id)

            console.log('Recorded ' + sentence + ' (' + sentence.id + ') by ' + author)
        })

        req.pipe(foo.busboy)
}}
