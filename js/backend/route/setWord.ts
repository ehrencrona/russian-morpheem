import * as express from 'express'

import Corpus from '../../shared/Corpus'
import Word from '../../shared/Word'
import InflectedWord from '../../shared/InflectedWord'
import { JsonFormat } from '../../shared/Word'
import { TranslatableWord } from '../../shared/Words'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let wordId = req.params['word']

        if (!wordId) {
            throw new Error('No word sent')
        }

        let existingWord: TranslatableWord = corpus.words.get(wordId)

        if (!existingWord) {
            res.status(404).send({ error: `Unknown word ${wordId}.`})
            return
        }

        if (existingWord instanceof InflectedWord) {
            existingWord = (existingWord as InflectedWord).word
        }

        let word = Word.fromJson(req.body as JsonFormat, corpus.inflections)
        let author = getAuthor(req).name

        if (word.getEnglish() != existingWord.getEnglish()) {
            corpus.words.setEnglish(word.getEnglish(), existingWord)

            console.log('Stored translation "' + word.getEnglish() + '" for word ' + existingWord.getId() + ' by ' + author)
        }

        res.status(200).send({})
    }
}