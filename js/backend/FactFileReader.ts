/// <reference path="../../typings/node-4.d.ts"/>
"use strict";

import { readFile } from 'fs';
import parseFactFile from '../shared/fact/FactFileParser';

import Inflections from '../shared/Inflections';

export default function readFactFile(fileName: string, inflections: Inflections, lang: string) {
    return new Promise((resolve, reject) => {        
        readFile(fileName, 'utf8', function (err, body) {
            if (err) {
                return reject(err)
            }

            try {
                resolve(parseFactFile(body, inflections, lang))
            }
            catch (e) {
                reject(e)
            }
        })
    });
}
