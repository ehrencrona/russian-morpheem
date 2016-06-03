import Inflection from './Inflection';

export interface GeneratedInflection {
    stem: string,
    inflection: Inflection
}

export default class Inflections {
    inflectionsById : { [s: string]: Inflection }
    inflections: Inflection[] = []

    onAdd: (inflection: Inflection) => void = null
    
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
    
    static fromJson(json): Inflections {
        let result = new Inflections()
        
        for (let inflectionJson of json) {
            result.add(Inflection.fromJson(inflectionJson, result))
        } 
        
        return result
    }

    get(id) {
        return this.inflectionsById[id]
    }

    getAllPos(): string[] {
        let all : { [s: string]: boolean } = {}

        this.inflections.forEach((inflection) => {
            if (inflection.pos) {
                all[inflection.pos] = true
            }
        })
        
        return Object.keys(all)
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
            this.onAdd(inflection)
        }
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

    toJson() {
        let result = []
        
        for (let id in this.inflectionsById) {
            result.push(this.inflectionsById[id].toJson())    
        }
        
        return result
    }

    generateInflectionForWord(word: string): Promise<GeneratedInflection> {
        return Promise.resolve(
            {
                inflection: this.getPossibleInflections(word)[0],
                stem: 'n/a'
            }
        )
    }
}