import { AbstractAnyWord } from '../../shared/AbstractAnyWord';
import * as express from 'express'

import Corpus from '../../shared/Corpus'
import Word from '../../shared/Word'
import InflectedWord from '../../shared/InflectedWord'
import InflectableWord from '../../shared/InflectableWord'

import { Derivation, getDerivations } from '../../shared/inflection/WordForms';
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

        if (!(existingFact instanceof AbstractAnyWord)) {
            res.status(401).send({ error: `The fact ${wordId} is not a translatable word.`})
            return
        }
        else {
            if (!existingFact) {
                res.status(404).send({ error: `Unknown word ${wordId}.`})
                return
            }

            let existingWord: AbstractAnyWord = existingFact.getWordFact()

            let word = Word.fromJson(req.body as JsonFormat, corpus.inflections)

            word.resolveDerivations(req.body as JsonFormat, corpus.words)

            let author = getAuthor(req).name

            if (!word.wordForm.equals(existingWord.wordForm)) {
                corpus.words.setWordForm(word.wordForm, existingWord)

                console.log(author + ' changed word form for word ' + 
                    existingWord.getId() + ' to ' + JSON.stringify(word.wordForm))
            }

            findChangedDerivations(word, existingWord).forEach(derivation => {
                let id = derivation.id

                console.log(`${author} changed derivation ${id} for ` +
                    `${existingWord.getId()} from ${existingWord.getDerivedWords(id).map(w => w.getId())} ` +
                    `to ${word.getDerivedWords(id).map(w => w.getId())}.`)

                corpus.words.removeDerivedWords(existingWord, id, ... existingWord.getDerivedWords(id))
                corpus.words.addDerivedWords(existingWord, id, ... word.getDerivedWords(id))
            })

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

function findChangedDerivations(word1: AnyWord, word2: AnyWord): Derivation[] {
    return getDerivations(word1.wordForm).filter(d => {
        let derivedWords2 = word2.getDerivedWords(d.id)
        let derivedWords1 = word1.getDerivedWords(d.id)

        return derivedWords1.length != derivedWords2.length ||
            word1.getDerivedWords(d.id).find((word, index) => 
                word.getId() != derivedWords2[index].getId())
    })
}