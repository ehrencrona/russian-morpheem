/// <reference path="./node.d.ts"/>
"use strict";

import { writeFile } from 'fs';
import factsToString from '../shared/FactFileGenerator';
import Words from '../shared/Words';
import Facts from '../shared/Facts';
import Sentences from '../shared/Sentences';

export default function writeFactFile(fileName, facts: Facts) {
    return new Promise((resolve, reject) => {
        writeFile(fileName, factsToString(facts), { encoding: 'utf8' }, (err) => {
            if (err) {
                return reject(err)
            }
        })
    })
}
