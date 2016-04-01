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

var DAY = 24 * 60 * 60;

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

        it('should return 1 immediately after not knowing a fact', function () {
            let knowledge = new Knowledge()

            knowledge.didntKnow(fact(1), 0)

            knowledge.getKnowledge(fact(1), 0).should.equal(1)
        })

        it('should decay', function () {
            let knowledge = new Knowledge()

            knowledge.knew(fact(1), 0)

            knowledge.getKnowledge(fact(1), 1).should.be.below(1)
        })

        it('should estimate knowledge of words I keep forgetting lower than such I always remember', function() {
            let knowledge = new Knowledge()

            var easyFact = fact(1)
            var hardFact = fact(2)

            knowledge.saw(hardFact, 0)
            knowledge.saw(easyFact, 0)

            knowledge.didntKnow(hardFact, 10)

            knowledge.knew(hardFact, 10)
            knowledge.knew(easyFact, 10)

            knowledge.getKnowledge(hardFact, 15).should.be.below(knowledge.getKnowledge(easyFact, 15))
        })

        it('should decay slower when there is more time between repetitions', function() {
            let fastRep = new Knowledge()
            let slowRep = new Knowledge()
            var secondRep = 30

            slowRep.knew(fact(1), secondRep - 30)
            fastRep.knew(fact(1), secondRep - 5)

            slowRep.knew(fact(1), secondRep)
            fastRep.knew(fact(1), secondRep)

            slowRep.getKnowledge(fact(1), secondRep + 30).should.be.above(
                fastRep.getKnowledge(fact(1), secondRep + 30)
            )
        })

        it('should have strength 0 with no knowledge', function () {
            let knowledge = new Knowledge()

            knowledge.getStrength(fact(1), 0).should.equal(0)
        })

        it('retention should develop reasonably over a few days', function () {
            let knowledge = new Knowledge()

            let afact = fact(1)

            knowledge.saw(afact, 0)
            knowledge.knew(afact, 0)
            knowledge.knew(afact, 600)
            knowledge.knew(afact, 1200)

            knowledge.knew(afact, DAY)

            knowledge.getKnowledge(afact, 2 * DAY).should.be.below(0.5)

            knowledge.knew(afact, 2 * DAY)

            knowledge.getKnowledge(afact, 3 * DAY).should.be.above(0.1)

            knowledge.knew(afact, 7 * DAY)

            knowledge.getKnowledge(afact, 9 * DAY).should.be.above(0.5)
        })

        it('should increase strength after knew', function () {
            let knowledge = new Knowledge()

            knowledge.knew(fact(1), 0)

            var strength = knowledge.getStrength(fact(1), 0)

            knowledge.knew(fact(1), 1)

            knowledge.getStrength(fact(1), 1).should.be.above(strength)
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

        it('estimates you have a 50-50 chance of forgetting a new fact after a minute', function() {
            let knowledge = new Knowledge()

            knowledge.saw(fact(1), 0)
            knowledge.knew(fact(1), 0)

            knowledge.getKnowledge(fact(1), 60).should.be.below(0.7).and.above(0.2)
        })

        it('estimates you have a low chance of remembering something you forgot the first time on the second repetition', function() {
            let knowledge = new Knowledge()

            knowledge.saw(fact(1), 0)
            knowledge.didntKnow(fact(1), 0)

            knowledge.getKnowledge(fact(1), 60).should.be.below(0.5)
        })

        it('estimates you have an extremely low chance of remembering something you forgot twice', function() {
            let knowledge = new Knowledge()

            knowledge.saw(fact(1), 0)
            knowledge.didntKnow(fact(1), 0)
            knowledge.didntKnow(fact(1), 10)

            knowledge.getKnowledge(fact(1), 60).should.be.below(0.25)
        })

        it('estimates your memory is pretty much in long-term memory if you remember a new fact after a day', function() {
            let knowledge = new Knowledge()

            knowledge.saw(fact(1), 0)
            knowledge.knew(fact(1), 0)
            knowledge.knew(fact(1), 24 * 60 * 60)

            knowledge.getKnowledge(fact(1), 2 * 24 * 60 * 60).should.be.above(0.5)
        })
    })
})