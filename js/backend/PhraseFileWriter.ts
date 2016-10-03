/// <reference path="../../typings/node-4.d.ts"/>
"use strict";

import { writeFile } from 'fs';
import phrasesToString from '../shared/phrase/PhraseFileGenerator';
import Words from '../shared/Words';
import Phrases from '../shared/phrase/Phrases';
import Sentences from '../shared/Sentences';

export default function writePhraseFile(fileName, phrases: Phrases) {
    if (phrases.all().length < 2) {
        throw new Error('Refusing to write empty file.')
    }

    return new Promise((resolve, reject) => {
        writeFile(fileName, phrasesToString(phrases), { encoding: 'utf8' }, (err) => {
            if (err) {
                return reject(err)
            }
            else {
                resolve()
            }
        })
    })
}
