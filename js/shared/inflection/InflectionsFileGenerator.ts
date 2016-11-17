'use strict'

import Inflections from './Inflections'
import Inflection from './Inflection'
import Ending from '../Ending'
import { INFLECTION_FORMS } from './InflectionForms'
import { getNonRedundantNamedForms } from './WordForms'

function endingToString(ending: Ending) {
    let result = ''
    
    if (ending.relativeTo) {
        result = ending.relativeTo + '-'
    }
    
    for (let i = 0; i < ending.subtractFromStem; i++) {
        result += '<'
    }

    result += ending.suffix

    return result
}

function inflectionToString(inflection: Inflection, lang: string) {
    let forms = INFLECTION_FORMS[inflection.wordForm.pos]
    
    if (!forms) {
        console.error(`Unknown PoS ${inflection.wordForm.pos} in language ${lang} for inflection ${inflection.id}. It will not be stored.`)
        return
    }
    
    let endings = []
    
    forms.allForms.forEach((form) => {
        let ending = inflection.endings[form]
        
        if (ending) {
            endings.push(form + ' ' + endingToString(ending))
        }
    })

    let inherit = ''
    
    if (inflection.inherits.length) {
        inflection.inherits.forEach((parent) => 
            inherit += ', inherit ' + parent.id
        )

        if (!endings.length) {
            inherit = inherit.substr(2)
        }
    }
    
    let transformString = ''

    if (inflection.transforms.length) {
        inflection.transforms.forEach((transform) => {
            transformString = ', transform ' + transform.getId() 
        })
    }

    let formString = getNonRedundantNamedForms(inflection.wordForm)
        .map(form => ', form ' + form.id).join('')

    let description = ''

    if (inflection.description) {
        description = '"' + inflection.description + '" '
    }

    return `${inflection.id}: ${ description }${ endings.join(', ') }${ inherit }${ formString }${ transformString }`
}

export default function inflectionsToString(inflections: Inflections, lang: string) {
    return inflections.inflections.map((i) => inflectionToString(i, lang)).join('\n')
}