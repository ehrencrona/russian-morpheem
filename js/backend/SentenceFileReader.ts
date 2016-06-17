/// <reference path="../../typings/node-4.d.ts"/>
"use strict";

import { readFile } from 'fs';
import parseSentenceFile from '../shared/SentenceFileParser';
import Words from '../shared/Words';
import Facts from '../shared/Facts';

export default function readSentenceFile(fileName, words: Words, facts: Facts) {
    return new Promise((resolve, reject) => {
        readFile(fileName, 'utf8', function (err, body) {
            if (err) {
                return reject(err)
            }

            try {
                let sentences = parseSentenceFile(body, words, facts)

                console.log('Read ' + sentences.sentences.length + ' sentences.')

                resolve(sentences)
            }
            catch (e) {
                reject(e)
            }
        })
    })
}
