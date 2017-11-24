import { readFile } from 'fs';
import parsePhraseFile from '../shared/phrase/PhraseFileParser';

import Phrases from '../shared/phrase/Phrases';
import Words from '../shared/Words';
import Inflections from '../shared/inflection/Inflections'

export default function readPhraseFile(fileName: string, words: Words, inflections: Inflections, lang: string) {
    return new Promise((resolve, reject) => {        
        readFile(fileName, 'utf8', function (err, body) {
            if (err) {
                return reject(err)
            }

            try {
                resolve(parsePhraseFile(body, words, inflections))
            }
            catch (e) {
                reject(e)
            }
        })
    });
}
