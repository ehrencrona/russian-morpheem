
import InflectedWord from '../shared/InflectedWord'
import Transform from './Transform'

export class EndingTransform implements Transform {

    constructor(public from: string, public to: string, public after: string, public id: string) {
        this.from = from
        this.to = to
        this.after = after
        this.id = id
    }
    
    visitFacts(visitor: (Fact) => any) {
        visitor(this)
    }

    isApplicable(stem: string, ending: string) {
        return stem.length && ending.length &&
            ending[0] == this.from &&
            this.after.indexOf(stem[stem.length-1]) >= 0
    } 

    apply(ending: string) {
        return this.to + ending.substr(1)
    }

    getId() {
        return this.id
    }
}

const TRANSFORM_BY_ID = {
    yToI: new EndingTransform('ы', 'и', 'кгшщхчжь', 'yToI')
}

class Transforms {

    get(id: string): Transform {
        return TRANSFORM_BY_ID[id]
    }

    visitAll(visitor: (Transform) => void): Transform[] {
        return Object.keys(TRANSFORM_BY_ID).map((key) => this.get(key))
    }

}

export default new Transforms()
