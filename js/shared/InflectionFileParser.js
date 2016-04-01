'use strict'

const Inflection = require('./Inflection')

module.exports = (data) => {
    let inflections = [];
    let inflectionById = {};

    function parseEndings(str) {
        let result = {}
        let inherits
        let defaultForm 
        
        for (let pair of str.split(',')) {
            let elements = pair.split(':')
            
            if (elements.length != 2) {
                throw new Error('Expected "' + pair + '" to be of the form <form>:<ending>, e.g. "gen: -y"')
            }
            
            let ending = elements[1].trim()
            
            if (ending[0] == '-') {
                ending = ending.substr(1)
            }

            let form = elements[0].trim()
            
            if (form == 'inherit') {
                inherits = ending.trim()
            }
            else {            
                if (ending.match(/[a-z]/)) {
                    throw new Error(ending + ' in ' + str + ' contains Latin characters.')
                }

                if (!defaultForm) {
                    defaultForm = form
                }
                
                result[form] = ending.trim()
            }            
        }

        return { default: defaultForm, endings: result, inherits: inherits }
    }

    for (let line of data.split('\n')) {
        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        let i = line.indexOf(':')

        if (i < 0) {
            new Error('Every line should start with the ID of the inlection followed by colon. "' + line + '" does not.')
        }

        let id = line.substr(0, i)
        let rightSide = line.substr(i + 1)

        let endings = parseEndings(rightSide)

        let inflection

        if (endings.inherits) {
            let parent = inflectionById[endings.inherits]
            
            if (parent) {
                inflection = new Inflection(id, parent.defaultForm, endings.endings)
                
                inflection.inherit(parent)
            }
            else {
                throw new Error('Inheriting unknown inflection "' + endings.inherits.trim() + '"')
            }

        }
        else {
            inflection = new Inflection(id, endings.default, endings.endings)
        }

        inflectionById[id] = inflection
        inflections.push(inflection)
    }

    return inflections
}