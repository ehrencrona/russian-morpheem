'use strict'

import Grammar from './Grammar'
import Fact from './fact/Fact'

export default class TagFact extends Grammar implements Fact {
    constructor(public id) {
        super(id, '')
    }

    visitFacts(visitor: (Fact) => any) {
        visitor(this)
    }
}