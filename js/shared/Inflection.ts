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
    
    constructor(public id, public defaultForm, public pos, public endings) {
        this.id = id
        this.pos = pos
        this.defaultForm = defaultForm
        this.endings = endings
    } 

    static fromJson(json, inflections: Inflections) {
        let result = new Inflection(json.id, json.defaultForm, json.pos, json.endings)
        
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
            pos: this.pos,
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
            if (this.endings[form] == inflection.endings[form]) {
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

    getFact(form): InflectionFact {
        if (this.endings[form] != null) {
            return new InflectionFact(this.id + '@' + form, this, form);
        }
        else if (this.inherits) {                
            return this.inherits.getFact(form)
        }
        else {
            throw new Error('Unknown form ' + form + ' in ' + this.id)
        }
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
    
    hasForm(form) {
        let result = this.endings[form]
        
        if (result !== undefined) {
            return true
        }
        else if (this.inherits) {                
            return this.inherits.hasForm(form)
        }
        else {
            return false
        }
    }

    inflect(word: InflectedWord, stem, form: string) {
        let iw = new InflectedWord(
            stem + this.getEnding(form), stem, word.infinitive, form)
            .requiresFact(this.getFact(form))
            
        iw.setInflection(this)
        
        return iw
    }
    
    inflectAll(dictionaryForm: InflectedWord, stem: string, excludeInherited: boolean, exclude: any): InflectedWord[] {
        let result: InflectedWord[] = []
        
        exclude = exclude || {}

        let at: Inflection = this
        
        do {            
            for (let form in at.endings) {
                if (exclude[form]) {
                    continue
                }
                
                exclude[form] = true
                
                result.push(this.inflect(dictionaryForm, stem, form));
            }

            if (!excludeInherited) {
                at = at.inherits
            }
            else {
                at = null
            }
        }
        while (at)

        return result;
    }
}