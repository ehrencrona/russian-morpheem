import Inflection from './Inflection';

export default class Inflections {
    inflectionsById : { [s: string]: Inflection }
    
    constructor(public inflections : Inflection[]) {
        this.inflectionsById = {}
        
        for (let inflection of inflections) {
            this.inflectionsById[inflection.getId()] = inflection
        }
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