/// <reference path="./node.d.ts"/>
"use strict";

import { readFile } from 'fs';
import parseFactFile from '../shared/FactFileParser';

import Inflections from '../shared/Inflections';

export default function readFactFile(fileName: string, inflections: Inflections) {
    return new Promise((resolve, reject) => {        
        readFile(fileName, 'utf8', function (err, body) {
            if (err) {
                return reject(err)
            }

            resolve(parseFactFile(body, inflections))
        })
    });
}
