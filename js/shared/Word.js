"use strict";

require('./inheritance-clientserver.js')

var UnstudiedWord = require('./UnstudiedWord')

/**
 * A word has a Japanese spelling, an English translation an optional list of grammar that is required to understand it.
 */
var Word = UnstudiedWord.extend({
    visitFacts: function(visitor) {
        visitor(this)

        this.visitRequired(visitor)
    },

    getId: function() {
        return this.jp + (this.classifier ? '[' + this.classifier + ']' : '')
    }
})

module.exports = Word