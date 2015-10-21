"use strict";

require('./inheritance-clientserver.js')

/**
 * Represents a piece of grammar knowledge. It has an ID and is associated as a precondition of other facts (words or grammar)
 * or sentences. The learner is assumed to have seen an example of the application of this rule when exposed to something
 * that requires a grammar rule. After a certain number of examples it is assumed to be known. Grammar rules must therefore
 * be encoded in such a way that this is true; if rules have exceptions or irregularities these must be turned into own
 * rules.
 */
var Grammar = Class.extend({
    init: function(id, explanation) {
        this.id = id
        this.explanation = explanation
    },

    visitFacts: function(visitor) {
        visitor(this)

        if (this.required) {
            for (let fact of this.required) {
                visitor(fact)
            }
        }
    },

    related: function() {
        // TODO: make relations symmetric
        // not implemented yet

        return this
    },

    getId: function() {
        return this.id
    },

    /** Indicates that this fact is more difficult than average (i.e. a vocabulary word) */
    isHardFact: function() {
        return true
    },

    toString: function() {
        return this.id
    },

    requiresFact: function(fact) {
        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    }
})

module.exports = Grammar
