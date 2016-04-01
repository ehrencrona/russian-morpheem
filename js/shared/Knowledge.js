"use strict";

/**
 * TODO: certain facts are just harder to remember for no obvious reason. if they have proven to decay quickly
 * before, bring them more often.
 * TODO: grammar is harder to remember than words
 */


var _ = require('underscore')

const DAY_IN_SEC = 100000

// the index in the DECAY list we start out it. we don't start on 0
// since failing the first test needs to increase decay.
const DEFAULT_STRENGTH = 0.5 / 60

const DECAY = []

// if you didn't know the fact on the very first repetition knowledge
// takes 15 seconds to sink to 50% (if you did know it, it sinks as
// described by the next DECAY entry)
DECAY[DEFAULT_STRENGTH] = 0.5 / 60

var DECAY_IMPROVEMENT_BY_STRENGTH = 4

for (let i = DEFAULT_STRENGTH-1; i >= 0; i--) {
    DECAY[i] = DECAY[i+1] * DECAY_IMPROVEMENT_BY_STRENGTH
}

// later repetitions: knowledge falls half as fast on every repetition
while (DECAY[DECAY.length - 1] > 2 / 200000) {
    DECAY.push(DECAY[DECAY.length - 1] / DECAY_IMPROVEMENT_BY_STRENGTH)
}

console.log(DECAY)

// we assume you never completely forget something you've once learned,
// this is the minimum chance of remembering. this not being 0 also makes
// it possible to check through getKnowledge if something was ever studied
const MINIMUM_KNOWLEDGE = 0.01


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

            var decay = strength

            var result = 1 - (time - lastKnownTime) * decay

            return (result >= MINIMUM_KNOWLEDGE ? result : MINIMUM_KNOWLEDGE)
        }
    }

    saw(fact, time) {
        this.updateFact(fact, time, 0)
    }

    knew(fact, time) {
        // how surprising was it that we didn't know this?
        // if it was very surprising the strength needs updating.
        // if it wasn't, it was probably appropriate.
        var surprise = 1 - this.getKnowledge(fact, time)

        this.updateFact(fact, time, surprise)
    }

    didntKnow(fact, time) {
        // how surprising was it that we didn't know this?
        // if it was very surprising the strength needs updating.
        // if it wasn't, it was probably appropriate.
        var surprise = this.getKnowledge(fact, time)

        this.updateFact(fact, time, -surprise)
    }

    updateFact(fact, time, surprise) {
        var tuple = this.byId[fact.getId()]

        if (!tuple) {
            this.byId[fact.getId()] = [ time, DEFAULT_STRENGTH ]
        }
        else {
            // last known time
            tuple[0] = time
            // strength

            var oldStrength = tuple[1]

            // TODO: document, conceptualize and rename
            var foo = 6

            var s = surprise * surprise

            var voodoo = (surprise < 0 ?
                1 / ( 1 + (foo + 1) * s) :
                1 + (foo - 1) * s)

            tuple[1] = tuple[1] / voodoo

            console.log('update at', time, '. surprise', surprise, '. strength is now', tuple[1], 'from previously', oldStrength,
                'Sure to forget after',
                    Math.round(10 / tuple[1] / 60) / 10, 'minutes'

            )

        }
    }
}

module.exports = Knowledge

