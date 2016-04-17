import Inflection from './Inflection';

export default class Inflections {
    inflectionsById : { [s: string]: Inflection }
    inflections: Inflection[] = []
    
    constructor(inflections? : Inflection[]) {
        this.inflectionsById = {}
        
        for (let inflection of inflections || []) {
            this.add(inflection)
        }
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
    }
    
    getInflection(id) {
        return this.inflectionsById[id]        
    }

    
    toJson() {
        let result = []
        
        for (let id in this.inflectionsById) {
            result.push(this.inflectionsById[id].toJson())    
        }
        
        return result
    }
}