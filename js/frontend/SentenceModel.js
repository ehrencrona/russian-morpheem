"use strict";

var _ = require('underscore')

var Sentence = require('../shared/Sentence')
var Knowledge = require('../shared/Knowledge')
var typecheck = require('../shared/typecheck')

class SentenceModel {

    constructor(sentence, factKnowledge, time) {
        typecheck(arguments, Sentence, Knowledge)

        this.sentence = sentence
        this.factKnowledge = factKnowledge

        this.meaning = sentence.english
        this.explanation = sentence.english

        this.words = sentence.words

        var factsById = {}
        this.factsById = factsById

        this.newFacts = [
            'な'
        ]

    }

    /**
     * Visits objects { fact: <Fact>, knowledge: <float> }
     * @param word Optional. If not set, iterates through all facts
     */
    visitKnownFacts(visitor, word) {
        // TODO: facts by word
        this.sentence.visitFacts((fact) => visitor({
            fact: fact,
            knowledge: this.factKnowledge.getKnowledge(fact, time)
        }))
    }

}

module.exports = SentenceModel