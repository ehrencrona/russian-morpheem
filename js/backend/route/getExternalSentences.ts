import * as express from 'express'

import { getSentencesForFact } from '../external/ExternalCorpus'
import { ExternalSentence } from '../../shared/external/ExternalSentence'

import Corpus from '../../shared/Corpus'
import getAuthor from '../getAuthor'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let fact = corpus.facts.get(req.params.fact)

        if (!fact) {
            throw new Error(`No such fact "${req.params.fact}".`)
        }

        getSentencesForFact(fact)
            .then((sentences: ExternalSentence[]) => {
                corpus.sentenceHistory
                    .getExistingExternalIds(sentences.map((sentence) => sentence.id.toString()))
                    .then((existingIds) => {
                        sentences = sentences.filter((sentence) =>
                            existingIds.indexOf(sentence.id.toString()) < 0
                        )
                        
                        res.status(200).send(sentences)
                    })
            })
            .catch((e) => {
                console.error(e.stack)
                res.status(500).send(e)
            })
    }
}