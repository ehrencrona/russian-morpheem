"use strict";

var SentenceModel = require('./SentenceModel')
var NextSentenceCalculator = require('../shared/NextSentenceCalculator')
var Sentence = require('../shared/Sentence')
var Word = require('../shared/Word')
var Knowledge = require('../shared/Knowledge')

function isUnstudied(fact) {
    return !fact.getId
}

module.exports =
    [ '$scope', '$interval', '_', 'corpus',
        function($scope, $interval, _, corpusPromise) {
            var factKnowledge = $scope.factKnowledge
            var sentenceKnowledge = $scope.sentenceKnowledge

            console.log('factKnowldege')

            corpusPromise.then((corpus) => {

                function update() {
                    let time = new Date().getTime() / 1000
                    let knownFacts = []

                    for (let fact of corpus.facts) {
                        if (isUnstudied(fact)) {
                            continue
                        }

                        var knowledge = factKnowledge.getKnowledge(fact, time)

                        if (knowledge > 0) {
                            knownFacts.push({
                                knowledge: knowledge,
                                fact: fact,
                                strength: factKnowledge.getStrength(fact, time)
                            })
                        }
                    }

                    _.sortBy(knownFacts, (knownFact) => -knownFact.knowledge )

                    $scope.knownFacts = knownFacts

                    $scope.sentenceScores = _.filter(_.map(corpus.sentences, (sentence) => {
                        return {
                            sentence: sentence,
                            strengthAtRisk: NextSentenceCalculator.getStrengthAtRisk(sentence, factKnowledge, time),
                            chanceOfUnderstandingForgotten: NextSentenceCalculator.getChanceOfUnderstanding(sentence, sentenceKnowledge, factKnowledge, time),
                            knowledge: sentenceKnowledge.getKnowledge(sentence, time)
                        }
                    }), (sentenceScore) => {
                        return sentenceScore.strengthAtRisk || sentenceScore.chanceOfUnderstandingForgotten || sentenceScore.knowledge
                    })
                }

                update()

                $interval(() => {
                    update()
                }, 1000)
            })

        }]

