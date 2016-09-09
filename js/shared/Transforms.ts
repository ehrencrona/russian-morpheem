
import InflectedWord from '../shared/InflectedWord'
import Transform from './Transform'
import Ending from './Ending'

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

    isApplicable(stem: string, ending: Ending) {
        let suffix = ending.suffix

        return stem.length && suffix.length &&
            suffix[0] == this.from &&
            this.after.indexOf(stem[stem.length-1-ending.subtractFromStem]) >= 0
    } 

    apply(ending: string) {
        return this.to + ending.substr(1)
    }

    getId() {
        return this.id
    }
}

const TRANSFORM_BY_ID = {
    yToI: new EndingTransform('ы', 'и', 'кгшщхчжь', 'yToI'),
    ioToY: new EndingTransform('ю', 'у', 'кгшщхчж', 'ioToY'),
    yaToA: new EndingTransform('я', 'а', 'кгшщхчж', 'yaToA'),
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
