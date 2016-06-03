/// <reference path="../../typings/node-4.d.ts"/>
"use strict";

import { writeFile } from 'fs';

import Inflections from '../shared/Inflections';
import inflectionsToString from '../shared/InflectionsFileGenerator';

export default function writeInflectionsFile(fileName, inflections: Inflections, lang: string) {
    return new Promise((resolve, reject) => {
        writeFile(fileName, inflectionsToString(inflections, lang), { encoding: 'utf8' }, (err) => {
            if (err) {
                return reject(err)
            }
        })
    })
}
