"use strict";

var parser = require('../js/shared/FactFileParser')

var should = require('should')

var Word = require('../js/shared/Word')
var Grammar = require('../js/shared/Grammar')

// ぎ:gi, requires: き, grammar: ktog

var noGrammar = () => {
    throw new Error('Shouldn\'t be called')
}

describe('FactFileParser', function() {
    it('parses word and meaning', function () {
        var words = parser('word:meaning', noGrammar)

        words[0].jp.should.equal('word')

        words[0].getEnglish().should.equal('meaning')
    })

    it('handles classifiers', function () {
        var words = parser('word[type]:meaning', noGrammar)

        words[0].jp.should.equal('word')
        words[0].classifier.should.equal('type')
    })

    it('handles requires', function () {
        var words = parser('a:meaning\nb:meaning, requires: a', noGrammar)

        words[1].required[0].should.equal(words[0])
    })
})
