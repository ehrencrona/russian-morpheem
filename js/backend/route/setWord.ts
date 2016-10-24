import * as express from 'express'

import Corpus from '../../shared/Corpus'
import Word from '../../shared/Word'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'

import { JsonFormat } from '../../shared/Word'
import AnyWord from '../../shared/AnyWord'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let wordId = req.params['word']

        if (!wordId) {
            throw new Error('No word sent')
        }

        let existingFact = corpus.facts.get(wordId)

        if (!(existingFact instanceof Word || existingFact instanceof InflectableWord)) {
            res.status(401).send({ error: `The fact ${wordId} is not a translatable word.`})
            return
        }
        else {
            let existingWord: AnyWord = existingFact as AnyWord

            if (!existingWord) {
                res.status(404).send({ error: `Unknown word ${wordId}.`})
                return
            }

            if (existingWord instanceof InflectedWord) {
                existingWord = (existingWord as InflectedWord).word
            }

            let word = Word.fromJson(req.body as JsonFormat, corpus.inflections)
            let author = getAuthor(req).name

            Object.keys(word.en).forEach((form) => {
                if (word.getEnglish(form) != existingWord.getEnglish(form)) {
                    corpus.words.setEnglish(word.getEnglish(form), existingWord, form)

                    console.log('Stored translation "' + word.getEnglish(form) + '" for word ' + existingWord.getId() + ' by ' + author)
                }
            })

            res.status(200).send({})
        }
    }
}