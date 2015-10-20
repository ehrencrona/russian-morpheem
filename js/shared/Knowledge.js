"use strict";

var _ = require('underscore')

const DAY_IN_SEC = 100000

// if you didn't know the fact on the very first repetition knowledge
// takes 30 seconds to sink to 50%.
const DECAY = [ 0.5 / 30 ]

// we assume you never completely forget something you've once learned,
// this is the minimum chance of remembering. this not being 0 also makes
// it possible to check through getKnowledge if something was ever studied
const MINIMUM_KNOWLEDGE = 0.01

// later repetitions: knowledge falls half as fast on every repetition
while (DECAY[DECAY.length - 1] > 0.5 / 250000) {
    DECAY.push(DECAY[DECAY.length - 1] / 2)
}

class Knowledge {
    constructor() {
        /**
         * Maps IDs of facts to a tuple containing
         *  - the last time the knowledge was 1
         *  - the number of times the fact has been known
         *    (this is proportional to the strength)
         */
        this.byId = {}
    }

    getStrength(fact) {
        var tuple = this.byId[fact.getId()]

        if (!tuple) {
            return 0
        }
        else {
            let strength = tuple[1]

            return strength
        }
    }

    getKnowledge(fact, time) {
        var tuple = this.byId[fact.getId()]

        if (!tuple) {
            return 0
        }
        else {
            let lastKnownTime = tuple[0]
            let strength = tuple[1]

            var result = 1 - (time - lastKnownTime) * DECAY[strength]

            return (result >= MINIMUM_KNOWLEDGE ? result : MINIMUM_KNOWLEDGE)
        }
    }

    knew(fact, time) {
        this.updateFact(fact, time, 1)
    }

    didntKnow(fact, time) {
        this.updateFact(fact, time, 0)
    }

    updateFact(fact, time, strengthChange) {
        var tuple = this.byId[fact.getId()]

        if (!tuple) {
            this.byId[fact.getId()] = [ time, strengthChange ]
        }
        else {
            // last known time
            tuple[0] = time
            // strength
            tuple[1] += strengthChange
        }
    }
}

module.exports = Knowledge

