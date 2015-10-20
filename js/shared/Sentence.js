"use strict";

var _ = require('underscore')
var Word = require('./Word').Word
var UnstudiedWord = require('./UnstudiedWord')

/**
 * A sentence is a list of Japanese words with an English translation. It can optionally require certain grammar facts.
 */
var Sentence = Class.extend({
    init: function(words, id) {
        this.words = words
        this.id = id
    },

    getId: function() {
        if (this.id === undefined) {
            throw new Error('No ID present.')
        }

        return this.id
    },

    setEnglish: function(en) {
        this.english = en
    },

    en: function() {
        return this.english
    },

    jp: function() {
        var res = ''

        for (let word of this.words) {
            res += word.jp + ' '
        }

        return res
    },

    requiresFact: function(fact) {
        if (!this.required) {
            this.required = []
        }

        this.required.push(fact)

        return this
    },

    visitFacts: function(visitor) {
        for (let word of this.words) {
            word.visitFacts(visitor)
        }

        if (this.required) {
            for (let fact of this.required) {
                fact.visitFacts(visitor)
            }
        }
    },

    toString: function() {
        var res = ''

        for (let word of this.words) {
            res += word.toString() + ' '
        }

        return res
    }
})

module.exports = Sentence