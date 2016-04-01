"use strict";

module.exports =
    function(sentence, visitor) {
        let seenFacts = {}

        sentence.visitFacts((fact) => {
            if (!seenFacts[fact.getId()]) {
                visitor(fact)

                seenFacts[fact.getId()] = true
            }
        })
    }
