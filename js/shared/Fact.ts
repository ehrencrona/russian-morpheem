"use strict";

interface Fact {
    getId(): string,
    visitFacts(visistor: (Fact) => any): any
}

export default Fact