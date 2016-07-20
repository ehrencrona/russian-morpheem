/// <reference path="../../../typings/node-4.d.ts"/>

import readCorpus from '../CorpusReader'
import InflectionFact from '../../shared/inflection/InflectionFact'

import writeFactFile from '../FactFileWriter'
import { getCorpusDir } from '../CorpusReader'

import Fact from '../../shared/fact/Fact'

import Word from '../../shared/Word'
import InflectableWord from '../../shared/InflectableWord'
import { readFile } from 'fs';

const CLASSES = 4

readCorpus('ru', false)
.then((corpus) => {
    console.log('Read corpus.')

    let corpusDir = getCorpusDir('ru')

    readFile(corpusDir + '/order.txt', 'utf8', function (err, body) {
        try {
            let facts = corpus.facts
            let wordsByDiff: Fact[][] = []

            body.split('\n').forEach((line) => {
                let i = line.lastIndexOf(' ')

                if (i < 0) {
                    throw new Error(`No space in "${line}"`)
                }

                let id = line.substr(0, i)
                let pos = parseInt(line.substr(i+1))

                if (isNaN(pos)) {
                    throw new Error(`NaN position in "${line}".`)
                }

                if (!wordsByDiff[pos]) {
                    wordsByDiff[pos] = []
                }

                let fact = corpus.facts.get(id)

                if (!fact) {
                    throw new Error(`Unknown fact ${id}`)
                }

                facts.remove(fact)

                wordsByDiff[pos].push(fact)
            })

            let words = []

            wordsByDiff.forEach((wordsForDiff) => {
                words = words.concat(wordsForDiff)
            })

            let atNew = 300
            let step = (words.length + facts.facts.length - 300) / (facts.facts.length - 300)

            while (words.length && atNew < facts.facts.length) {
                let nextAtNew = atNew + step

                let add = Math.round(nextAtNew) - Math.round(atNew) - 1;

                while (add > 0) {
                    facts.add(words[0])
                    facts.move(words[0], Math.round(nextAtNew))
console.log('add ' + words[0].getId() + ' at ' + Math.round(nextAtNew))
                    words.splice(0, 1)

                    add--
                }

                atNew = nextAtNew
            }

            if (words.length) {
                console.log('added another ' + words.length + ' words')

                words.forEach((word) => facts.add(word))
            }

            console.log('done. writing')

            writeFactFile(corpusDir + '/facts.txt', facts)
            .catch((e) => console.error(e.stack))
            .then(() => {
                console.log('done')
                process.exit()
            })
            
            console.log('?')
        }
        catch (e) {
            console.log(e.stack)
        }
    })


})