"use strict";

const REPEAT_ABOVE_STRENGTH_AT_RISK = 1
const PICK_WORD_UNDER_KNOWLEDGE = 0.3
const ALMOST_FORGOTTEN = 0.1

var _ = require('underscore')

var visitUniqueFacts = require('./visitUniqueFacts')

function reduceKnowledge(fact, iteratee, memo) {
    var result = memo

    visitUniqueFacts(fact, (fact) => {
        if (result === undefined) {
            return
        }

        // return undefined to break iteration
        result = iteratee(result, fact)
    })

    return result || memo
}

function getStrengthAtRisk(fact, factKnowledge, time) {
    return reduceKnowledge(fact, (result, fact) => {
        var knowledge = factKnowledge.getKnowledge(fact, time)

        if (knowledge == 0) {
            // break iteration
            return
        }

        if (knowledge > 0 && knowledge < 1) {
            var strength = factKnowledge.getStrength(fact)

            // if we're sure we've forgotten about the fact it's not at risk, it's gone.
            // if we're sure we know the fact it's not at risk, it's safe.
            result += knowledge * (1 - knowledge) * strength
        }

        return result
    }, 0)
}

// for each decile of the likelihood of understanding a sentence, what is the "flow value" of it,
// i.e. how much will the learner appreciate seeing it. a sentence that is 100% certain to be known
// is too easy, one that has 30% chance of being known is probably too hard.
var flowByChance = [
    /*  0 - 10% */   0, 0.01, 0.05, 0.1, 0.2,
    /* 50 - 60% */ 0.4,    1,    1, 0.6, 0, 0 ]

function flow(chanceOfUnderstanding) {
    return flowByChance[Math.floor(chanceOfUnderstanding * 10)]
}

function getChanceOfUnderstanding(sentence, sentenceKnowledge, factKnowledge, time) {
    var knowledgeOfAllFacts = 1

    visitUniqueFacts(sentence, (fact) => {
        knowledgeOfAllFacts *= factKnowledge.getKnowledge(fact)
    })

    return Math.max(knowledgeOfAllFacts, sentenceKnowledge.getKnowledge(sentence))
}

function scoreSentences(sentences, getScore) {
    var sentenceScores = []

    for (let sentence of sentences) {
        sentenceScores.push( { sentence: sentence, score: getScore(sentence) } )
    }

    sentenceScores = _.sortBy(sentenceScores, (score) => -score.score)

    return sentenceScores
}

function calculateNextSentenceMaximizingStrengthAtRisk(sentences, sentenceKnowledge, factKnowledge, time) {
    return scoreSentences(sentences, (sentence) => {
        var knowledge = sentenceKnowledge.getKnowledge(sentence)
        var strengthAtRisk = getStrengthAtRisk(sentence, factKnowledge, time)

        console.log(sentence.id, 'strengthAtRisk', strengthAtRisk, 'knowledge', knowledge, ' -> ', strengthAtRisk * (1 - knowledge))

        return strengthAtRisk * (1 - knowledge)
    })
}

function getChanceOfUnderstandingForgotten(fact, factKnowledge, time) {
    return reduceKnowledge(fact, (result, fact) => {
        var knowledge = factKnowledge.getKnowledge(fact, time)

        if (knowledge == 0) {
            // break iteration
            return
        }

        if (knowledge < ALMOST_FORGOTTEN) {
            result *= knowledge
        }

        return result
    }, 1)
}

function calculateNextSentenceAmongForgottenFacts(sentences, sentenceKnowledge, factKnowledge, time) {
    return scoreSentences(sentences, (sentence) => {
        var chance = getChanceOfUnderstandingForgotten(sentence, factKnowledge, time)

        if (chance == 1 || chance == 0) {
            return 0
        }

        // 0 knowledge for unknown sentence is not good, but we do prefer better known sentences since it
        // makes it easier to recognize the word
        var knowledge = 0.5 + sentenceKnowledge.getKnowledge(sentence)

        console.log(sentence.id, 'chance', chance, 'sentenceKnowledge', knowledge, ' -> ', chance * knowledge)

        return chance * knowledge
    })
}

class DelegatingKnowledge {
    constructor(delegate) {
        this.delegate = delegate
    }

    getStrength(fact) {
        return delegate.getStrength(fact)
    }

    getKnowledge(fact, time) {
        return delegate.getKnowledge(fact, time)
    }
}

class ExtendedKnowledge extends DelegatingKnowledge {
    constructor(delegate, newFact) {
        super(delegate)

        this.newFact = newFact
    }

    getKnowledge(fact, time) {
        if (fact.getId() == this.newFact.getId()) {
            return 0.01
        }
        else {
            return this.delegate.getKnowledge(fact, time)
        }
    }
}

function calculateNextSentence(sentences, sentenceKnowledge, factKnowledge, factOrder, time) {
    var sentenceScores = calculateNextSentenceMaximizingStrengthAtRisk(sentences, sentenceKnowledge, factKnowledge, time)

    if (!sentenceScores.length || sentenceScores[0].score < PICK_WORD_UNDER_KNOWLEDGE) {
        for (let fact of factOrder) {
            if (factKnowledge.getKnowledge(fact, time) == 0) {
                console.log('next fact', fact)

                factKnowledge = new ExtendedKnowledge(factKnowledge, fact)

                break
            }
        }

        sentenceScores = calculateNextSentenceAmongForgottenFacts(sentences, sentenceKnowledge, factKnowledge, time)
    }

    return sentenceScores
}


function knowledgeOfAllFacts(knowledge, fact, time) {
    var result = 1

    fact.visitFacts((fact) => {
        result *= knowledge.getKnowledge(fact, time)
    })

    return result
}

module.exports = {
    flow: flow,
    getStrengthAtRisk: getStrengthAtRisk,
    getChanceOfUnderstanding: getChanceOfUnderstanding,
    calculateNextSentenceMaximizingStrengthAtRisk: calculateNextSentenceMaximizingStrengthAtRisk,
    calculateNextSentenceAmongForgottenFacts: calculateNextSentenceAmongForgottenFacts,
    calculateNextSentence: calculateNextSentence,
    ALMOST_FORGOTTEN: ALMOST_FORGOTTEN
}