'use strict'

import InflectedWord from '../InflectedWord'
import Inflections from './Inflections'
import InflectionFact from './InflectionFact'
import Grammar from '../Grammar'
import Ending from '../Ending'
import { Transform } from '../Transform'
import allTransforms from '../Transforms'

/** 
  * Describes a way of inflecting a word (by adding endings to a stem). Also serves as Fact. 
  */
export default class Inflection {
    inherits: Inflection
    transforms: Transform[] = []

    constructor(public id, public defaultForm, public pos, public endings: { [s: string]: Ending }) {
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
        
        if (json.transforms) {
            result.transforms = json.transforms.map((id) => allTransforms.get(id))
        }

        return result
    }

    toJson() {
        return {
            id: this.id,
            defaultForm: this.defaultForm,
            pos: this.pos,
            endings: this.endings,
            inherits: (this.inherits ? this.inherits.id : undefined),
            transforms: (this.transforms.length ? this.transforms.map((transform) => transform.getId()) : undefined)
        }
    }

    getId() {
        return this.id;
    }
    
    inherit(inflection) {
        this.inherits = inflection

        function isFormSame(i1: Ending, i2: Ending, inflection: Inflection) {

            if (i2.relativeTo && !i2.subtractFromStem) {
                i2 = inflection.getEnding(i2.relativeTo)
            }

            return i1.suffix == i2.suffix &&
                i1.relativeTo == i2.relativeTo &&
                i1.subtractFromStem == i2.subtractFromStem
        }

        for (let form in this.endings) {
            let inheritedEnding = inflection.getEnding(form)

            if (inheritedEnding && isFormSame(this.endings[form], inheritedEnding, inflection)) {
                console.log('Form ' + form + ' of ' + this.id + ' is same as inherited value.')

                delete this.endings[form]
            }
        }
        
        return this
    }

    addTransform(transform: Transform) {
        this.transforms.push(transform)

        return this
    }

    visitFacts(visitor: (Fact) => any) {
        for (let form in this.endings) {
            visitor(this.getFact(form));
        }
    }

    getFact(form): InflectionFact {
        if (this.endings[form] != null) {
            return new InflectionFact(this.id + '@' + form, this, form)
        }
        else if (this.inherits) {                
            return this.inherits.getFact(form)
        }
        else {
            throw new Error('Unknown form ' + form + ' in ' + this.id)
        }
    }
    
    getInflectionId(form): string {
        if (this.endings[form] != null) {
            return this.id
        }
        else if (this.inherits) {                
            return this.inherits.getInflectionId(form)
        }
    }

    getEnding(form): Ending {
        let result = this.endings[form]
        
        if (result !== undefined) {
            return result
        }
        else if (this.inherits) {                
            return this.inherits.getEnding(form)
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

    getSuffix(ending: Ending, stem: string) {
        let suffix = ending.suffix

        this.visitTransforms((transform: Transform) => {
            if (transform.isApplicable(stem, suffix)) {
                suffix = transform.apply(suffix)
            }
        })

        return suffix
    }

    getInflectedForm(stem: string, form: string) {
        let ending = this.getEnding(form)

        if (!ending) {
            return
        }

        let suffix = this.getSuffix(ending, stem)

        if (ending.relativeTo) {
            stem = this.getInflectedForm(stem, ending.relativeTo)
        }

        return this.addSuffix(stem, ending, suffix)
    }

    visitTransforms(visitor: (Transform) => void) {
        let at: Inflection = this
         
        do {
            at.transforms.forEach((transform) => visitor(transform))

            at = at.inherits 
        } while (at)

        return at
    }

    addSuffix(stem: string, ending: Ending, suffix: string) {
        if (ending.subtractFromStem > 0) {
            stem = stem.substr(0, stem.length - ending.subtractFromStem)
        }

        return stem + suffix
    }

    getAllForms(): string[] {
        let result = {}
        let at: Inflection = this

        do {
            Object.assign(result, at.endings)
            
            at = at.inherits
        } while (at)
        
        return Object.keys(result)
    }

}