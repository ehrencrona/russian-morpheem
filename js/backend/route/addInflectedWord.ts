import * as express from 'express'

import Corpus from '../../shared/Corpus'
import InflectableWord from '../../shared/InflectableWord'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let stem = req.params['stem']

        if (!stem) {
            throw new Error('No stem sent')
        }
        
        let inflectionId = req.body.inflection
        let inflection = corpus.inflections.get(inflectionId)

        if (!inflection) {
            throw new Error(`Could not find ${inflectionId}.`)
        }

        let word = new InflectableWord(stem, inflection)    
        
        word.setEnglish('n/a')

        corpus.words.addInflectableWord(word)
        corpus.facts.add(word)

        console.log('Added word ' + word.getId() + ' with inflection ' + inflectionId)

        res.status(200).send({})
    }
}