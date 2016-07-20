import * as express from 'express'
import getAuthor from '../getAuthor'

import Corpus from '../../shared/Corpus'
import Word from '../../shared/Word'
import InflectableWord from '../../shared/InflectableWord'
import Phrase from '../../shared/phrase/Phrase'
import Inflection from '../../shared/inflection/Inflection'
import { findSentencesForFact } from '../../shared/SentencesByFactIndex'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let fact = corpus.facts.get(req.params['id'])

        if (!fact) {
            throw new Error('Unknown fact.')
        }

        if (findSentencesForFact(fact, corpus.sentences, corpus.facts, 0).count > 0) {
            res.status(403).send({ error: 'This fact is still in use.'})
        }
        else {
            corpus.facts.remove(fact)
            
            if (fact instanceof Inflection) {
                corpus.inflections.remove(fact)
            }

            if (fact instanceof Phrase) {
                corpus.phrases.remove(fact)
            }

            if (fact instanceof Word) {
                corpus.words.remove(fact)
            }

            if (fact instanceof InflectableWord) {
                corpus.words.removeInflectableWord(fact)
            }

            let author = getAuthor(req)
            console.log(author.name + ' deleted ' + fact.getId() + '.')

            res.status(200).send({ })
        }
    }
}