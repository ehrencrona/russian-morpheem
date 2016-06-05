import * as express from 'express'

import Corpus from '../../shared/Corpus'
import InflectableWord from '../../shared/InflectableWord'
import getInflections from '../InflectionDatabase'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let wordId = req.params['word']
        let inflectionId = req.params['inflection']
        
        let inflection = corpus.inflections.get(inflectionId)
        
        if (!inflection) {
            throw new Error(`Could not find ${inflectionId}.`)
        }

        let word = corpus.facts.get(wordId)

        if (!word) {
            throw new Error(`Could not find ${wordId}.`)
        }

        if (word instanceof InflectableWord) {            
            corpus.words.changeInflection(word, inflection)
                
            console.log(`Changed inflection of ${word} to ${inflectionId}.`)
        }
        else {
            throw Error(word + ' is not inflected')
        }
    }
}