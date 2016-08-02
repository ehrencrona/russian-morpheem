'use strict'

import InflectedWord from '../InflectedWord'
import Inflections from './Inflections'
import InflectionFact from './InflectionFact'
import Grammar from '../Grammar'
import Ending from '../Ending'
import Transform from '../Transform'
import allTransforms from '../Transforms'

type Endings = { [s: string]: Ending }

export interface JsonFormat {
    id: string,
    defaultForm: string,
    pos: string,
    endings: Endings,
    inherits?: string[],
    transforms?: string[],
    description?: string
}

/** 
  * Describes a way of inflecting a word (by adding endings to a stem). Also serves as Fact. 
  */
export default class Inflection {
    inherits: Inflection[] = []
    transforms: Transform[] = []

    constructor(public id, public defaultForm, public pos, public endings: Endings, public description?: string) {
        this.id = id
        this.pos = pos
        this.defaultForm = defaultForm
        this.endings = endings
        this.description = description
    } 

    static fromJson(json: JsonFormat, inflections: Inflections) {
        let result = new Inflection(json.id, json.defaultForm, json.pos, json.endings, json.description)
        
        if (json.inherits) {
            json.inherits.forEach((inheritId) => {
                let parent = inflections.get(inheritId)

                if (!parent) {
                    throw new Error('Unknown parent ' + inheritId)
                }

                result.inherit(parent)
            })
        }

        if (json.transforms) {
            result.transforms = json.transforms.map((id) => allTransforms.get(id))
        }

        return result
    }

    toJson(): JsonFormat {
        return {
            id: this.id,
            defaultForm: this.defaultForm,
            pos: this.pos,
            endings: this.endings,
            inherits: (this.inherits.length ? this.inherits.map((inflection) => inflection.id) : undefined),
            transforms: (this.transforms.length ? this.transforms.map((transform) => transform.getId()) : undefined),
            description: this.description
        }
    }

    getId() {
        return this.id;
    }
    
    inherit(inflection: Inflection) {
        this.inherits.push(inflection)

        function isFormSame(i1: Ending, i2: Ending, inflection: Inflection) {

            if (i2.relativeTo && !i2.subtractFromStem) {
                i2 = inflection.getEnding(i2.relativeTo)

                if (!i2) {
                    return !i1 
                }
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

    fromFirstParent(map: (Inflection) => any) {
        for (let parent of this.inherits) {
            let result = map(parent) 

            if (result) {
                return result
            }
        }
    }

    getFact(form): InflectionFact {
        if (this.endings[form] != null) {
            return new InflectionFact(this.id + '@' + form, this, form)
        }
        else {
            return this.fromFirstParent((parent) => parent.getFact(form))
        }
    }
    
    getInflectionId(form): string {
        if (this.endings[form] != null) {
            return this.id
        }
        else {                
            return this.fromFirstParent((parent) => parent.getInflectionId(form))
        }
    }

    getEnding(form): Ending {
        let result = this.endings[form]
        
        if (result !== undefined) {
            return result
        }
        else {
            return this.fromFirstParent((parent) => parent.getEnding(form))
        }
    }
    
    hasForm(form) {
        let result = this.endings[form]
        
        if (result !== undefined) {
            return true
        }
        else {
            return this.fromFirstParent((parent) => parent.hasForm(form))
        }
    }

    getSuffix(ending: Ending, stem: string) {
        let suffix = ending.suffix
        let transforms: Transform[] = []

        this.visitTransforms((transform: Transform) => {
            if (transform.isApplicable(stem, suffix)) {
                suffix = transform.apply(suffix)
                transforms.push(transform)
            }
        })

        return { suffix: suffix, transforms: transforms }
    }

    getInflectedForm(stem: string, form: string) {
        let ending = this.getEnding(form)

        if (!ending) {
            return
        }

        let transformedSuffix = this.getSuffix(ending, stem)

        let transforms = transformedSuffix.transforms

        if (ending.relativeTo) {
            let inflectedRelative = this.getInflectedForm(stem, ending.relativeTo)

            if (inflectedRelative) {
                stem = inflectedRelative.form
                transforms = transforms.concat(inflectedRelative.transforms)

                if (stem == null) {
                    throw new Error(`The form ${ending.relativeTo} that ${form} was relative to in ${this.id} did not exist.`)
                }
            }
            else {
                console.warn(this.id + '@' + form + ' refers to undefined form ' + ending.relativeTo)
                stem = ''
            }
        }

        return { 
            form: this.addSuffix(stem, ending, transformedSuffix.suffix),
            transforms: transforms 
        }
    }

    visitParents(visitor: (Inflection) => void) {
        visitor(this)

        this.inherits.forEach((parent) => {
            parent.visitParents(visitor)            
        })
    }

    visitTransforms(visitor: (Transform) => void) {
        this.visitParents((inflection: Inflection) => {
            inflection.transforms.forEach((transform) => visitor(transform))
        })
    }

    addSuffix(stem: string, ending: Ending, suffix: string) {
        if (ending.subtractFromStem > 0) {
            stem = stem.substr(0, Math.max(stem.length - ending.subtractFromStem, 0))
        }

        return stem + suffix
    }

    getAllForms(): string[] {
        let result = {}

        this.visitParents((inflection: Inflection) =>
            Object.assign(result, inflection.endings))
        
        return Object.keys(result)
    }

}