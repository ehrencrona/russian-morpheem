'use strict'

const InflectedWord = require('./InflectedWord')
const Grammar = require('./Grammar')

/** 
  * Describes a way of inflecting a word (by adding endings to a stem). Also serves as Fact. 
  */
module.exports = class Inflection {
    constructor(id, defaultForm, endings) {
        this.id = id
        this.defaultForm = defaultForm
        this.endings = endings
    } 

    getId() {
        return this.id;
    }
    
    inherit(inflection) {
        this.inherits = inflection
        
        for (let form in this.endings) {
            if (this.endings[form] == inflection.getEnding(form)) {
                console.log('Form ' + form + ' of ' + this.id + ' is same as inherited value.')
                
                delete this.endings[form]
            }
        }
    }

    visitFacts(visitor) {
        for (let form in this.endings) {
            visitor(this.getFact(form));
        }                
    }

    getFact(form) {
        return new Grammar(this.id + '@' + form);
    }
    
    getEnding(form) {
        let result = this.endings[form]
        
        if (result !== undefined) {
            return result
        }
        else if (this.inherits) {                
            return this.inherits.getEnding(form)
        }
        else {
            throw new Error('Inflection ' + this.id + 
                ' (or one of its children) does not contain the form "' + form + '".');
        }
    }
    
    inflect(dictionaryForm, stem, excludeInherited, exclude) {
        let result = []
        
        exclude = exclude || {}

        for (let form in this.endings) {
            if (exclude[form]) {
                continue
            }
            
            exclude[form] = true
            result.push(new InflectedWord(stem + this.endings[form], stem, dictionaryForm, form)
                .requiresFact(this.getFact(form)));
        }

        if (this.inherits && !excludeInherited) {
            result = result.concat(this.inherits.inflect(dictionaryForm, stem, false, exclude))
        }

        return result;
    }
}