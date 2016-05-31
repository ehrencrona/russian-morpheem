/// <reference path="./node.d.ts"/>
"use strict";

import { readFile } from 'fs';
import parseInflectionFile from '../shared/InflectionFileParser';

export default function readInflectionFile(fileName, lang: string) {
    return new Promise((resolve, reject) => {        
        readFile(fileName, 'utf8', function (err, body) {
            if (err) {
                return reject(err)
            }

            try {
                resolve(parseInflectionFile(body, lang))
            }
            catch (e) {
                reject(e)
            }
        })
    })
}
