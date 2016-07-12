/// <reference path="../../typings/node-4.d.ts"/>

import { readFile } from 'fs';
import parsePhraseFile from '../shared/phrase/PhraseFileParser';

import Phrases from '../shared/phrase/Phrases';
import Words from '../shared/Words';

export default function readPhraseFile(fileName: string, words: Words, lang: string) {
    return new Promise((resolve, reject) => {        
        readFile(fileName, 'utf8', function (err, body) {
            if (err) {
                return reject(err)
            }

            try {
                resolve(parsePhraseFile(body, words))
            }
            catch (e) {
                reject(e)
            }
        })
    });
}
