"use strict";

var SentenceModel = require('./SentenceModel')
var NextSentenceModel = require('./NextSentenceModel')
var Sentence = require('../shared/Sentence')
var Word = require('../shared/Word')
var Knowledge = require('../shared/Knowledge')

module.exports =
    [ '$scope', '_',
        function($scope, _) {
            function getKnownFactsByKnowledge(sentence) {
                var knownFactsByKnowledge = []

                sentence.visitKnownFacts((knownFact) => {
                    knownFactsByKnowledge.push(knownFact)
                })

                knownFactsByKnowledge = _.sortBy(knownFactsByKnowledge, (knownFact) => -knownFact.knowledge )

                return knownFactsByKnowledge
            }

            var na = new Word('な')
            var ka = new Word('か')

            var sentences = [
                new Sentence([  na, ka ], 4711)
            ]

            var factOrder = [ na, ka ]

            $scope.sentence =
                new NextSentenceModel(new Knowledge(), new Knowledge(), sentences, factOrder).
                    nextSentence([], [], null, 0)

            $scope.reveal = () => {
                $scope.revealed = true
            }

            $scope.knownFactsByKnowledge = getKnownFactsByKnowledge($scope.sentence)
        }]

