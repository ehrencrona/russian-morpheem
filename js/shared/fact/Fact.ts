"use strict";

interface Fact {
    getId(): string,
    visitFacts(visitor: (Fact) => any): any
}

export default Fact