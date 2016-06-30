/// <reference path="../../typings/node-4.d.ts"/>
"use strict";

import { writeFile } from 'fs';
import factsToString from '../shared/fact/FactFileGenerator';
import Words from '../shared/Words';
import Facts from '../shared/fact/Facts';
import Sentences from '../shared/Sentences';

export default function writeFactFile(fileName, facts: Facts) {
    if (facts.facts.length < 5) {
        throw new Error('Refusing to write empty file.')
    }

    return new Promise((resolve, reject) => {
        writeFile(fileName, factsToString(facts), { encoding: 'utf8' }, (err) => {
            if (err) {
                return reject(err)
            }
        })
    })
}
