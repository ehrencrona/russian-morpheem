'use strict'

import Inflections from './Inflections'
import Inflection from './Inflection'
import Ending from '../Ending'
import INFLECTION_FORMS from './InflectionForms'

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
    let forms = INFLECTION_FORMS[lang][inflection.pos]
    
    if (!forms) {
        console.error(`Unknown PoS ${inflection.pos} in language ${lang} for inflection ${inflection.id}. It will not be stored.`)
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
    
    if (inflection.inherits) {
        inherit = ', inherit ' + inflection.inherits.id
    }
    
    let transformString = ''

    if (inflection.transforms.length) {
        inflection.transforms.forEach((transform) => {
            transformString = ', transform ' + transform.getId() 
        })
    }

    return `${inflection.id}[${inflection.pos}]: ${ endings.join(', ') }${ inherit }${ transformString }`
}

export default function inflectionsToString(inflections: Inflections, lang: string) {
    return inflections.inflections.map((i) => inflectionToString(i, lang)).join('\n')
}