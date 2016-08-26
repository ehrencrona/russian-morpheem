import * as express from 'express'

import { PhraseStatus } from '../../shared/metadata/PhraseStatus'
import Corpus from '../../shared/Corpus'
import Phrase from '../../shared/phrase/Phrase'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let phraseId = req.params['id']

        if (!phraseId) {
            throw new Error('No phrase ID')
        }

        let gotStatus: PhraseStatus = req.body as PhraseStatus 

        let status: PhraseStatus = {}

        if (gotStatus.notes) {
            status.notes = gotStatus.notes
        }

        if (gotStatus.status != undefined) {
            status.status = gotStatus.status
        }

        status.phrase = phraseId

        let phrase: Phrase = corpus.phrases.get(phraseId)

        if (!phrase) {
            throw new Error('Unknown phrase')
        }

        let author = getAuthor(req)

        console.log(author.name + ' set state of ' + phrase + ' to ' + status.status + ' with notes "' + status.notes + '".')
 
        corpus.phraseHistory.setStatus(status, phraseId)

        res.status(200).send({ status: status })
    }
}