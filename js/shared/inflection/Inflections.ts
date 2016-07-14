import Inflection from './Inflection';
import Corpus from '../Corpus';

import { JsonFormat as InflectionJsonFormat } from './Inflection'

export type JsonFormat = InflectionJsonFormat[]

export class NotInflectedError {    
}

export interface GeneratedInflection {
    stem: string,
    inflection: Inflection
}

export default class Inflections {
    inflectionsById : { [s: string]: Inflection }
    inflections: Inflection[] = []

    onAdd: (inflection: Inflection) => void = null
    allPos: string[]
    
    constructor(inflections? : Inflection[]) {
        this.inflectionsById = {}
        
        for (let inflection of inflections || []) {
            this.add(inflection)
        }
    }

    clone(inflections: Inflections) {
        this.inflections = inflections.inflections
        this.inflectionsById = inflections.inflectionsById    
    }
    
    fromJson(json: JsonFormat): Inflections {
        for (let inflectionJson of json) {
            this.add(Inflection.fromJson(inflectionJson, this))
        } 
        
        return this
    }

    get(id) {
        return this.inflectionsById[id]
    }

    getAllPos(): string[] {
        if (!this.allPos) {
            let all : { [s: string]: boolean } = {}

            this.inflections.forEach((inflection) => {
                if (inflection.pos) {
                    all[inflection.pos] = true
                }
            })
            
            this.allPos = Object.keys(all)
        }

        return this.allPos
    }
    
    getForm(formId) {
        let els = formId.split('@')
        
        if (els.length == 2) {
            let inflection = this.get(els[0])

            if (!inflection) {
                throw new Error(`No form ${els[1]} of inflection ${els[0]}`)
            }

            return inflection.getFact(els[1])
        }
    }
    
    add(inflection: Inflection) {
        if (this.inflectionsById[inflection.getId()]) {
            throw new Error('Duplicate inflection ' + inflection.getId())
        }
        
        this.inflectionsById[inflection.getId()] = inflection
        this.inflections.push(inflection)
        
        if (this.onAdd) {
            console.log('Added inflection ' + inflection.id)
            
            this.onAdd(inflection)
        }

        this.allPos = null
    }
    
    getInflection(id) {
        return this.inflectionsById[id]        
    }

    getBestInflection(wordString: string) {
        let longestHit = ''
        let result
        
        this.inflections.forEach((inflection) => {
            let defaultEnding = inflection.getEnding(inflection.defaultForm)
            let suffix = defaultEnding.suffix
            
            if (wordString.substr(wordString.length - suffix.length) == suffix && 
                suffix.length >= longestHit.length) {
                longestHit = suffix
                result = inflection
            }
        })
        
        return result
    }

    getPossibleInflections(wordString: string) {
        return this.inflections.filter((inflection) => {
            let defaultEnding = inflection.getEnding(inflection.defaultForm)

            return wordString.substr(wordString.length - defaultEnding.suffix.length) == defaultEnding.suffix
        })
    }

    toJson(): JsonFormat {
        let result = []
        
        for (let id in this.inflectionsById) {
            result.push(this.inflectionsById[id].toJson())    
        }
        
        return result
    }

    generateInflectionForWord(word: string, corpus: Corpus): Promise<GeneratedInflection> {
        return Promise.resolve(
            {
                inflection: this.getPossibleInflections(word)[0],
                stem: 'n/a'
            }
        )
    }
}