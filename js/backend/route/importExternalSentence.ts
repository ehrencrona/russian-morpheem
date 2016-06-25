import * as express from 'express'

import { getExternalSentence } from '../external/ExternalCorpus'
import { ExternalSentence } from '../../shared/external/ExternalSentence'
import { STATUS_SUBMITTED } from '../../shared/metadata/SentenceStatus'
import { parseSentenceToWords } from '../../shared/external/parseSentenceToWords'
import Sentence from '../../shared/Sentence'
import UnstudiedWord from '../../shared/UnstudiedWord'
import getAuthor from '../getAuthor'

import Corpus from '../../shared/Corpus'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let source = req.params.source

        if (!source) {
            throw new Error('No source.')            
        }

        let externalid = parseInt(req.params.externalid)

        if (!externalid || isNaN(externalid)) {
            throw new Error('No or non-numerical external ID.')
        }

        getExternalSentence(externalid, source)
            .then((externalSentence: ExternalSentence) => {
                let parsedWords = parseSentenceToWords(externalSentence, corpus)

                let words = parsedWords
                    .filter((parsedWord) => typeof parsedWord == 'object')
                    .map((wordAlternatives: UnstudiedWord[]) => {
                        return wordAlternatives[0]
                    })

                let sentence = new Sentence(words, null, getAuthor(req).name)

                sentence.setEnglish(externalSentence.en)

                corpus.sentences.add(sentence)

                corpus.sentenceHistory.setStatus(
                    {
                        status: STATUS_SUBMITTED, 
                        author: sentence.author,
                        source: externalSentence.source,
                        externalId: externalSentence.id 
                    }, sentence.id)

                corpus.sentenceHistory.recordImport(sentence, sentence.author)

                console.log(sentence.author + ' imported ' + sentence + 
                    ' (' + externalSentence.source + ', ' + externalSentence.id + ') as ' + sentence.id + '.')

                res.status(200).send(sentence.toJson())
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}