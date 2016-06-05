import * as express from 'express'

import Corpus from '../../shared/Corpus'
import Word from '../../shared/Word'

export default function(corpus: Corpus) {
    return (req: express.Request, res: express.Response) => {
        let wordString = req.params['word']

        if (!wordString) {
            throw new Error('No word sent')
        }

        let word = new Word(wordString)
        
        word.setEnglish('n/a')

        corpus.words.addWord(word)
        corpus.facts.add(word)

        console.log('Added word ' + word.getId())

        res.status(200).send({})
    }
}