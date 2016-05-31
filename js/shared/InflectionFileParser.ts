'use strict'

import Inflection from './Inflection'
import Inflections from './Inflections'
import Ending from './Ending'
import { formExists } from '../shared/InflectionForms'

interface Endings {
    default: string, 
    endings: { [s: string]: Ending },
    inherits: string
}

export function parseEndings(str: string, lang?: string, pos?: string): Endings {
    let result : { [s: string]: Ending } = {}
    let inherits
    let defaultForm 

    for (let pair of str.split(',')) {
        let elements = pair.trim().split(/:? +/)

        if (elements.length > 2) {
            throw new Error('Expected "' + pair + '" to be of the form <form> <ending>, e.g. "gen y"')
        }

        let endingString = (elements[1] || '').trim()

        if (endingString[0] == '-') {
            endingString = endingString.substr(1)
        }

        let form = elements[0].trim()

        if (form == 'inherit') {
            inherits = endingString
        }
        else {
            if (lang && !formExists(lang, pos, form)) {
                console.warn(`The form ${form} is unknown for PoS ${pos} in language ${lang}.`)
            }

            let ending
            let relativeTo
            let suffix = endingString
            let subtractFromStem = 0

            if (endingString.indexOf('-') > 0) {
                relativeTo = endingString.split('-')[0]
                suffix = endingString.split('-')[1]
            }

            while (suffix[0] == '<') {
                suffix = suffix.substr(1)
                subtractFromStem++
            }

            if (lang == 'ru' && suffix.match(/[a-z]/)) {
                throw new Error(ending + ' in ' + str + ' ("' + suffix + '") contains Latin characters.')
            }

            ending = new Ending(
                suffix,
                relativeTo,
                subtractFromStem)

            if (!defaultForm) {
                defaultForm = form
            }
            
            result[form] = ending
        }            
    }

    return { default: defaultForm, endings: result, inherits: inherits }
}

export default function parseInflectionFile(data, lang?: string) {
    let inflections = [];
    let inflectionById = {};

    for (let line of data.split('\n')) {
        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        let i = line.indexOf(':')

        if (i < 0) {
            new Error('Every line should start with the ID of the inflection followed by colon. "' + line + '" does not.')
        }

        let id, pos
        
        let m = line.substr(0, i).match(/(.*)\[(.*)\]/)

        if (m) {
            id = m[1]
            pos = m[2]
        }
        else {
            id = line.substr(0, i)
        }
        
        let rightSide = line.substr(i + 1)

        let endings = parseEndings(rightSide, lang, pos)

        let inflection

        if (endings.inherits) {
            let parent = inflectionById[endings.inherits]

            if (parent) {
                inflection = new Inflection(id, parent.defaultForm, pos, endings.endings)
                
                inflection.inherit(parent)
            }
            else {
                throw new Error('Inheriting unknown inflection "' + endings.inherits.trim() + '"')
            }

        }
        else {
            inflection = new Inflection(id, endings.default, pos, endings.endings)
        }

        inflectionById[id] = inflection
        inflections.push(inflection)
    }

    return new Inflections(inflections)
}