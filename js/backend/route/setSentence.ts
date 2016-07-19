import * as express from 'express'

import Corpus from '../../shared/Corpus'
import Sentence from '../../shared/Sentence'
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
            let sentence = Sentence.fromJson(req.body, corpus.phrases, corpus.words)

            if (sentence.id != req.params['id']) {
                throw new Error('Inconsistent ID.');
            }

            let author = getAuthor(req).name

            let previous = corpus.sentences.get(sentence.id)

            if (sentence.en() != null && previous.en() != sentence.en()) {
                corpus.sentenceHistory.recordTranslate(sentence, author)
                console.log('Stored translation "' + sentence.en() + '" for sentence ' + sentence.id + ' by ' + author)
            }

            if (!previous.equals(sentence)) {
                corpus.sentenceHistory.recordEdit(sentence, author)
                console.log('Stored ' + sentence + ' (' + sentence.id + ') by ' + author)
            }

            corpus.sentences.store(sentence)

            res.status(200).send({})
        }
        catch (e) {
            res.status(500).send(e)
            console.error(e.stack)
        }
    }
}