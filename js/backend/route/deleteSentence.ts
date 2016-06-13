import * as express from 'express'
import getAuthor from '../getAuthor'

import { recordDelete, setStatus } from '../metadata/Metadata'
import Corpus from '../../shared/Corpus'
import Word from '../../shared/Word'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let sentence = corpus.sentences.get(req.params['id'])

        if (!sentence) {
            throw new Error('Unknown sentence.')
        }

        corpus.sentences.remove(sentence)
        
        let author = getAuthor(req)

        console.log(author.name + ' deleted ' + sentence + ' (' + sentence.id + ')')

        recordDelete(sentence, author.name)

        res.status(200).send({ })
    }
}