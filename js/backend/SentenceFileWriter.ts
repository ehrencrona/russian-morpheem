/// <reference path="../../typings/node-4.d.ts"/>
"use strict";

import { writeFile } from 'fs';
import sentencesToString from '../shared/SentenceFileGenerator';
import Words from '../shared/Words';
import Facts from '../shared/Facts';
import Sentences from '../shared/Sentences';

export default function writeSentenceFile(fileName, sentences: Sentences, words: Words) {
    if (sentences.sentences.length < 5) {
        throw new Error('Refusing to write empty file.')
    }

    return new Promise((resolve, reject) => {
        writeFile(fileName, sentencesToString(sentences, words), { encoding: 'utf8' }, (err) => {
            if (err) {
                return reject(err)
            }
        })
    })
}
