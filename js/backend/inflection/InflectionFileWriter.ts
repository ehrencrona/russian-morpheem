"use strict";

import { writeFile } from 'fs';

import Inflections from '../../shared/inflection/Inflections';
import inflectionsToString from '../../shared/inflection/InflectionsFileGenerator';

export default function writeInflectionFile(fileName, inflections: Inflections, lang: string) {
    return new Promise((resolve, reject) => {
        writeFile(fileName, inflectionsToString(inflections, lang), { encoding: 'utf8' }, (err) => {
            if (err) {
                return reject(err)
            }
            else {
                resolve()
            }
        })
    })
}
