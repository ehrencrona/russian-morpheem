"use strict";

import Fact from './Fact';

export default class AbstractFact implements Fact {
    required: Fact[]

    constructor(public id) {
    }

    visitFacts(visitor) {
        visitor(this)

        if (this.required) {
            for (let fact of this.required) {
                visitor(fact)
            }
        }
    }

    getId() {
        return this.id
    }

    toString() {
        return this.id
    }

    requiresFact(fact: Fact) {
        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    }
}
