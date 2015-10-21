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
        console.log('known', knownFacts)
        console.log('unknown', unknownFacts)

        for (let fact of knownFacts) {
            this.factKnowledge.knew(fact, time)
        }

        for (let fact of unknownFacts) {
            this.factKnowledge.didntKnow(fact, time)
        }

        if (lastSentence) {
            this.sentenceKnowledge.knew(lastSentence, time)

            console.log('sentence knowledge for ', lastSentence.getId(),
                this.sentenceKnowledge.getKnowledge(lastSentence, time))
        }

        var sentence = nextSentenceCalculator.calculateNextSentence(
            this.sentences, this.sentenceKnowledge, this.factKnowledge, this.factOrder, time)[0].sentence

        console.log('next sentence', sentence)

        return new SentenceModel(sentence, this.factKnowledge, time)
    }
}

module.exports = NextSentenceModel