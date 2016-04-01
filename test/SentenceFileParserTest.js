"use strict";

var parser = require('../js/shared/SentenceFileParser')

var should = require('should')

var Word = require('../js/shared/Word')
var Grammar = require('../js/shared/Grammar')

describe('SentenceFileParser', function() {
    it('parses words and meaning', function () {
        var a = new Word('a')

        var sentences = parser('a b: english', { a: a, b: new Word('b') },
            () => {
                throw new Error('Shouldn\'t be called')
            })

        sentences[0].words[0].should.equal(a)
        sentences[0].english.should.equal('english')
    })

    it('handles requires', function () {
        var a = new Word('a')

        var sentences = parser('a (requires: grammar): english', { a: a },
            (factId) => {
                factId.should.equal('grammar')

                return new Grammar('grammar')
            })

        sentences[0].words[0].should.equal(a)
        sentences[0].required[0].getId().should.equal('grammar')
    })
})
