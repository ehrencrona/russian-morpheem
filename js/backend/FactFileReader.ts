/// <reference path="../../typings/node-4.d.ts"/>

import { readFile } from 'fs'
import parseFactFile from '../shared/fact/FactFileParser'

import Inflections from '../shared/inflection/Inflections'
import Facts from '../shared/fact/Facts'
import Words from '../shared/Words'

export default function readFactFile(fileName: string, inflections: Inflections, lang: string): Promise<[Facts, Words]> {
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
