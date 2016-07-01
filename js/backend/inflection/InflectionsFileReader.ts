/// <reference path="../../../typings/node-4.d.ts"/>
"use strict";

import { readFile } from 'fs';
import parseInflectionsFile from '../../shared/inflection/InflectionsFileParser';

export default function readInflectionsFile(fileName, lang: string) {
    return new Promise((resolve, reject) => {        
        readFile(fileName, 'utf8', function (err, body) {
            if (err) {
                return reject(err)
            }

            try {
                resolve(parseInflectionsFile(body, lang))
            }
            catch (e) {
                reject(e)
            }
        })
    })
}
