"use strict";

import { readFile } from 'fs'
import parseSentenceFile from '../shared/SentenceFileParser'
import Words from '../shared/Words'
import Facts from '../shared/fact/Facts'
import Phrases from '../shared/phrase/Phrases'

export default function readSentenceFile(fileName, words: Words, phrases: Phrases) {
    return new Promise((resolve, reject) => {
        readFile(fileName, 'utf8', function (err, body) {
            if (err) {
                return reject(err)
            }

            try {
                let sentences = parseSentenceFile(body, words, phrases)

                console.log('Read ' + sentences.sentences.length + ' sentences.')

                resolve(sentences)
            }
            catch (e) {
                reject(e)
            }
        })
    })
}
