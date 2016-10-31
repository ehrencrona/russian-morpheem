'use strict'

interface Fact {
    getId(): string
    visitFacts(visitor: (Fact) => any): any
    requiresFact(fact: Fact)
}

export default Fact