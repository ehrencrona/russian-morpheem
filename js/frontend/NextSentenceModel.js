"use strict";

var SentenceModel = require('./SentenceModel')
var nextSentenceCalculator = require('../shared/NextSentenceCalculator')

class NextSentenceModel {
    constructor(factKnowledge, sentenceKnowledge, sentences, factOrder) {
        this.factKnowledge = factKnowledge
        this.sentenceKnowledge = sentenceKnowledge
        this.sentences = sentences
        this.factOrder = factOrder
    }

    /**
     * Returns a SentenceModel
     */
    nextSentence(knownFacts, unknownFacts, lastSentence, time) {
        for (let fact of knownFacts) {
            this.factKnowledge.knew(fact, time)
        }

        for (let fact of knownFacts) {
            this.factKnowledge.didntKnow(fact, time)
        }

        if (lastSentence) {
            this.sentenceKnowledge.knew(lastSentence, time)
        }

        var sentence = nextSentenceCalculator.calculateNextSentence(
            this.sentences, this.sentenceKnowledge, this.factKnowledge, this.factOrder, time)[0]

        return new SentenceModel(sentence, this.factKnowledge, time)
    }
}

module.exports = NextSentenceModel