'use strict'

import Inflection from './Inflection'
import Inflections from './Inflections'
import Ending from '../Ending'
import Transform from '../Transform'
import allTransforms from '../Transforms'
import { formExists } from './InflectionForms'
import INFLECTION_FORMS from './InflectionForms'

interface Endings {
    default: string, 
    endings: { [s: string]: Ending },
    inherits: string[],
    transforms: Transform[]
}

export function parseEndings(str: string, lang?: string, pos?: string, id?: string): Endings {
    let result : { [s: string]: Ending } = {}
    let inherits: string[] = []
    let defaultForm 
    let transforms: Transform[] = []

    for (let pair of str.split(',')) {
        let elements = pair.trim().split(/:? +/)

        if (elements.length > 2) {
            throw new Error('Expected "' + pair + '" in ' + id + ' to be of the form <form> <ending>, e.g. "gen y"')
        }

        let endingString = (elements[1] || '').trim()

        let form = elements[0].trim()
        
        if (form[form.length-1] == ':') {
            form = form.substr(0, form.length-1)
        }

        if (form == 'inherit') {
            inherits.push(endingString)
        }
        else if (form == 'transform') {
            let transform = allTransforms.get(endingString)

            if (!transform) {
                throw new Error(`Unknown transform ${endingString}`)
            }

            transforms.push(transform)
        }
        else {
            if (endingString[0] == '-') {
                endingString = endingString.substr(1)
            }

            if (lang && !formExists(lang, pos, form)) {
                console.warn(`The form ${form} is unknown for PoS ${pos} in language ${lang} when parsing "${id}".`)
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
                console.warn(form + ' in ' + str + ' ("' + suffix + '") contains Latin characters.')
            }

            ending = new Ending(
                suffix,
                relativeTo,
                subtractFromStem)

            if (!defaultForm) {
                defaultForm = form
            }
            
            if (result[form]) {
                console.warn(`Form ${ form } is defined twice for ${ id }.`)
            }

            result[form] = ending
        }            
    }

    return { default: defaultForm, endings: result, inherits: inherits, transforms: transforms }
}

export default function parseInflectionsFile(data, lang?: string) {
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

            let forms = INFLECTION_FORMS[lang][pos]
            
            if (!forms) {
                throw new Error(`Unknown PoS ${pos} in language ${lang} for inflection ${id}.`)
            }
        }
        else {
            id = line.substr(0, i)
        }
        
        let rightSide = line.substr(i + 1)

        let endings = parseEndings(rightSide, lang, pos, id)

        let defaultForm = INFLECTION_FORMS[lang][pos].allForms[0]

        let inflection = new Inflection(id, defaultForm, pos, endings.endings)

        endings.inherits.forEach((parentId) => {
            let parent = inflectionById[parentId]

            if (!parent) {
                throw new Error('Inheriting unknown inflection "' + parentId + '"')
            }

            inflection.inherit(parent)  
        })

        inflection.defaultForm = INFLECTION_FORMS[lang][pos].allForms.find((form) => inflection.hasForm(form))

        inflection.transforms = endings.transforms

        inflectionById[id] = inflection
        inflections.push(inflection)
    }

    return new Inflections(inflections)
}