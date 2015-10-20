"use strict";

var Knowledge = require('../js/shared/Knowledge')
var _ = require('underscore')

var should = require('should')

function fact(id) {
    return {
        getId: () => id,
        visitFacts: function(visitor) { visitor(this) }
    }
}

describe('Knowledge', function() {
    describe('getKnowledge()', function () {
        it('should return 0 when no fact has been recorded', function () {

            let knowledge = new Knowledge()

            knowledge.getKnowledge(fact(1), 0).should.equal(0)
        })

        it('should return 1 immediately after knowing a fact', function () {
            let knowledge = new Knowledge()

            knowledge.knew(fact(1), 0)

            knowledge.getKnowledge(fact(1), 0).should.equal(1)
        })

        it('should decay', function () {
            let knowledge = new Knowledge()

            knowledge.knew(fact(1), 0)

            knowledge.getKnowledge(fact(1), 1).should.be.below(1)
        })

        it('should have strength 0 with no knowledge', function () {
            let knowledge = new Knowledge()

            knowledge.getStrength(fact(1), 0).should.equal(0)
        })

        it('should have strength 1 with after knew', function () {
            let knowledge = new Knowledge()

            knowledge.knew(fact(1), 0)

            knowledge.getStrength(fact(1), 0).should.equal(1)
        })

        it('should decay faster when you don\'t know something', function () {
            let k1 = new Knowledge()

            k1.didntKnow(fact(1), 0)

            let k2 = new Knowledge()

            k2.knew(fact(1), 0)

            k1.getKnowledge(fact(1), 1).should.be.below(k2.getKnowledge(fact(1), 1))
        })

        it('should never get negative', function () {
            let knowledge = new Knowledge()

            knowledge.didntKnow(fact(1), 0)

            knowledge.getKnowledge(fact(1), 1000).should.be.below(0.02)
        })
    })
})