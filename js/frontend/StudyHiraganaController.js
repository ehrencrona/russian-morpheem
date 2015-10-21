"use strict";

var SentenceModel = require('./SentenceModel')
var NextSentenceModel = require('./NextSentenceModel')
var Sentence = require('../shared/Sentence')
var Word = require('../shared/Word')
var Knowledge = require('../shared/Knowledge')

function getTime() {
    return new Date().getTime() / 1000
}

module.exports =
    [ '$scope', '_', 'corpus',
        function($scope, _, corpusPromise) {
            function getKnownFactsByKnowledge(sentence) {
                var knownFactsByKnowledge = []

                sentence.visitKnownFacts((knownFact) => {
                    knownFact.known = true

                    knownFactsByKnowledge.push(knownFact)
                })

                knownFactsByKnowledge = _.sortBy(knownFactsByKnowledge, (knownFact) => knownFact.knowledge )

                return knownFactsByKnowledge
            }

            var factKnowledge = new Knowledge()
            var sentenceKnowledge = new Knowledge()

            $scope.factKnowledge = factKnowledge
            $scope.sentenceKnowledge = sentenceKnowledge

            corpusPromise.then((corpus) => {
                var nextSentenceModel = new NextSentenceModel(factKnowledge, sentenceKnowledge, corpus.sentences, corpus.facts)

                var current

                function nextSentence() {
                    function getFactsWhereKnownIs(known) {
                        if (!current) {
                            return []
                        }

                        return _.pluck(_.filter(current.knownFacts, (knownFact) => knownFact.known == known), 'fact')
                    }

                    var sentenceModel =
                        nextSentenceModel.
                            nextSentence(
                                getFactsWhereKnownIs(true),
                                getFactsWhereKnownIs(false),
                            ( current ?
                                current.sentenceModel.sentence :
                                null),
                            getTime())

                    var knownFactsByKnowledge = getKnownFactsByKnowledge(sentenceModel)

                    current = {
                        sentenceModel: sentenceModel,
                        knownFacts: knownFactsByKnowledge,
                        newFacts: _.pluck(_.filter(knownFactsByKnowledge, (knownFact) => knownFact.knowledge == 0), 'fact'),
                        revealed: false
                    }

                    $scope.current = current
                }

                nextSentence()

                $scope.reveal = () => {
                    current.revealed = true
                }

                $scope.toggleKnown = (knownFact) => {
                    knownFact.known = !knownFact.known
                }

                $scope.someForgotten = () => {
                    nextSentence()
                }

                $scope.allKnown = () => {
                    for (let knownFact of current.knownFacts) {
                        knownFact.known = true
                    }

                    nextSentence()
                }
            })

        }]

