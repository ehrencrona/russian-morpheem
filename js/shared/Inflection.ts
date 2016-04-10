'use strict'

import InflectedWord from './InflectedWord'
import Inflections from './Inflections'
import InflectionFact from './InflectionFact'
import Grammar from './Grammar'

/** 
  * Describes a way of inflecting a word (by adding endings to a stem). Also serves as Fact. 
  */
export default class Inflection {
    inherits: Inflection
    
    constructor(public id, public defaultForm, public endings) {
        this.id = id
        this.defaultForm = defaultForm
        this.endings = endings
    } 

    static fromJson(json, inflections: Inflections) {
        let result = new Inflection(json.id, json.defaultForm, json.endings)
        
        if (json.inherits) {
            let parent = inflections.get(json.inherits)
            
            if (!parent) {
                throw new Error('Unknown parent ' + json.inherits)
            }
            
            result.inherit(parent)
        }
        
        return result
    }

    toJson() {
        return {
            id: this.id,
            defaultForm: this.defaultForm,
            endings: this.endings,
            inherits: (this.inherits ? this.inherits.id : undefined)
        }
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
        
        return this
    }

    visitFacts(visitor: (Fact) => any) {
        for (let form in this.endings) {
            visitor(this.getFact(form));
        }
    }

    getFact(form) {
        return new InflectionFact(this.id + '@' + form, '');
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
                ' (or one of its parents) does not contain the form "' + form + '".');
        }
    }
    
    inflect(word: InflectedWord, stem, form: string) {
        let iw = new InflectedWord(
            stem + this.getEnding(form), stem, word.infinitive, form)
            .requiresFact(this.getFact(form))
            
        iw.setInflection(this)
        
        return iw
    }
    
    inflectAll(dictionaryForm, stem, excludeInherited: boolean, exclude: any) {
        let result = []
        
        exclude = exclude || {}

        for (let form in this.endings) {
            if (exclude[form]) {
                continue
            }
            
            exclude[form] = true
            
            result.push(this.inflect(dictionaryForm, stem, form));
        }

        if (this.inherits && !excludeInherited) {
            result = result.concat(this.inherits.inflectAll(dictionaryForm, stem, false, exclude))
        }

        return result;
    }
}