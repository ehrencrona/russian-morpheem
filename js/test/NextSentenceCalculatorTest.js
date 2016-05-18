"use strict";

var Knowledge = require('../js/shared/Knowledge')
var _ = require('underscore')

var nextSentenceCalculator = require('../js/shared/NextSentenceCalculator')

var should = require('should')

function fact(id) {
    return {
        getId: () => id,
        visitFacts: function(visitor) { visitor(this) }
    }
}

var noKnowledge = { getKnowledge: (sentence) => 0 }

function constantKnowledge(knowledge) {
    return {
        getKnowledge: (sentence) => knowledge,
        getStrength: (fact) => 10
    }
}

function compositeFact(factIdsAsIndividualParameters) {
    return {
        visitFacts: (visitor) => {
            for (let factId of arguments) visitor(fact(factId))
        },
        id: _.toArray(arguments).join(',')
    }
}

var knowledgeIsFactId = {
    getStrength: (fact) => 3,
    getKnowledge: (fact) => {
        return fact.getId()
    }
}

describe('NextSentenceCalculator', function() {
    describe('flow()', function() {

        it('should have zero flow for zero chance', function() {
            nextSentenceCalculator.flow(0).should.equal(0)
        })

        it('should have zero flow for 100% chance', function() {
            nextSentenceCalculator.flow(1).should.equal(0)
        })

        it('should have non-zero flow for 50% chance', function() {
            nextSentenceCalculator.flow(0.5).should.be.above(0)
        })

    })


    describe('getChanceOfUnderstanding()', function() {

        it('should equal the single fact in a sentence with one fact', function() {
            nextSentenceCalculator.getChanceOfUnderstanding(
                fact(1),
                noKnowledge,
                { getKnowledge: (fact) => 0.5 }, 0).should.equal( 0.5 )
        })

        it('should equal the product of all facts', function() {
            nextSentenceCalculator.getChanceOfUnderstanding(
                compositeFact(1, 2),
                noKnowledge,
                { getKnowledge: (fact) => 0.5 }, 0).should.equal( 0.25 )
        })

        it('should consider sentence knowledge', function() {
            nextSentenceCalculator.getChanceOfUnderstanding(
                fact(1),
                noKnowledge,
                { getKnowledge: (sentence) => 0.5 }, 0).should.equal( 0.5 )
        })

    })

    describe('getStrengthAtRisk()', function () {

        var k = new Knowledge()

        it('should be zero with no knowledge', function () {
            nextSentenceCalculator.getStrengthAtRisk(fact(1), noKnowledge, 0).should.equal(0)
        })

        it('should be zero with full knowledge', function () {
            nextSentenceCalculator.getStrengthAtRisk(fact(1), constantKnowledge(1), 0).should.equal(0)
        })

        it('should be non-zero with some knowledge', function () {
            nextSentenceCalculator.getStrengthAtRisk(fact(1), constantKnowledge(0.5), 0).should.be.above(0)
        })

        it('should be greater with two facts', function () {
            var someKnowledge = constantKnowledge(0.5)

            nextSentenceCalculator.getStrengthAtRisk(
                { visitFacts: (visitor) => {
                    visitor(fact(1)), visitor(fact(2))
                }  },
                someKnowledge, 0).should.be.above(
                nextSentenceCalculator.getStrengthAtRisk(fact(1), someKnowledge, 0))
        })
    })

    describe('calculateNextSentenceMaximizingStrengthAtRisk()', function () {

        it('should prefer some unknowns to all known and all unknown', function () {
            var unknown = compositeFact(0, 3, 6)
            var allKnown = compositeFact(2, 5, 8)
            var partiallyKnown = compositeFact(1, 4, 7)

            var a = nextSentenceCalculator.calculateNextSentenceMaximizingStrengthAtRisk([ unknown, allKnown, partiallyKnown],
                constantKnowledge(0),
                {
                    getStrength: (fact) => 3,
                    getKnowledge: (fact) => {
                        return 0.5 * (fact.getId() % 3)
                    }
                }, 0)[0]

            should.strictEqual(a.sentence, partiallyKnown)
        })

        it('should prefer not newly repeated', function () {
            var older = compositeFact(1)
            var newer = compositeFact(4)

            var a = nextSentenceCalculator.calculateNextSentenceMaximizingStrengthAtRisk([ older, newer ],
                {
                    getKnowledge: (fact) => {
                        if (!fact.id) throw new Error('No sentence id?')

                        // we'll use the ID of the sentence as the sentence knowledge
                        return fact.id / 4
                    }
                },
                constantKnowledge(0.5),
                0)[0]

            should.strictEqual(a.sentence, older)
        })

    })

    describe('calculateNextSentenceAmongForgottenFacts()', function() {
        it('show pick almost forgotten facts', function() {
            var known = fact(1)
            var unstudied = fact(0)
            var forgotten = fact(nextSentenceCalculator.ALMOST_FORGOTTEN - 0.01)

            var next = nextSentenceCalculator.calculateNextSentenceAmongForgottenFacts([ known, unstudied, forgotten ],
                constantKnowledge(1),
                knowledgeIsFactId
            )

            next[0].sentence.should.equal(forgotten)
        })

        it('show not pick anything completely unknown', function() {
            var unknown = fact(0)
            var forgotten = fact(nextSentenceCalculator.ALMOST_FORGOTTEN - 0.01)

            var next = nextSentenceCalculator.calculateNextSentenceAmongForgottenFacts([ compositeFact(forgotten, unknown) ],
                constantKnowledge(1),
                knowledgeIsFactId
            )

            next[0].score.should.equal(0)
        })

        it('show prefer less forgotten facts', function() {
            var forgotten = fact(nextSentenceCalculator.ALMOST_FORGOTTEN - 0.01)
            var moreForgotten = fact(nextSentenceCalculator.ALMOST_FORGOTTEN - 0.02)

            var next = nextSentenceCalculator.calculateNextSentenceAmongForgottenFacts([ moreForgotten, forgotten ],
                constantKnowledge(1),
                knowledgeIsFactId
            )

            next[0].sentence.should.equal(forgotten)
        })
    })

    describe('calculateNextSentence()', function() {
        it('show pick next fact if all existing are known', function() {
            var unknown = fact(0)
            var known = fact(1)

            var next = nextSentenceCalculator.calculateNextSentence([unknown, known],
                constantKnowledge(1),
                knowledgeIsFactId,
                [ known, unknown ]
            )

            next[0].sentence.should.equal(unknown)
        })
    })
})
