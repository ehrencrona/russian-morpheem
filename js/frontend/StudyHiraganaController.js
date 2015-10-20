"use strict";

var SentenceModel = require('./SentenceModel')
var NextSentenceModel = require('./NextSentenceModel')
var Sentence = require('../shared/Sentence')
var Word = require('../shared/Word')
var Knowledge = require('../shared/Knowledge')

module.exports =
    [ '$scope', '_', 'corpus',
        function($scope, _, corpusPromise) {
            function getKnownFactsByKnowledge(sentence) {
                var knownFactsByKnowledge = []

                sentence.visitKnownFacts((knownFact) => {
                    knownFactsByKnowledge.push(knownFact)
                })

                knownFactsByKnowledge = _.sortBy(knownFactsByKnowledge, (knownFact) => -knownFact.knowledge )

                return knownFactsByKnowledge
            }

            corpusPromise.then((corpus) => {
                $scope.sentence =
                    new NextSentenceModel(new Knowledge(), new Knowledge(), corpus.sentences, corpus.facts).
                        nextSentence([], [], null, 0)

                $scope.reveal = () => {
                    $scope.revealed = true
                }

                $scope.knownFactsByKnowledge = getKnownFactsByKnowledge($scope.sentence)
            })
        }]

