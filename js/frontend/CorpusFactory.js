"use strict";

var SentenceFileParser = require('../shared/SentenceFileParser')
var FactFileParser = require('../shared/FactFileParser')
var Word = require('../shared/Word')

function failedLoading(err) {
    // no idea what else we could do here. retry?
    throw err
}

const BASE_URL = '/corpus/hiragana/'

/**
 * Currently returns only the hiragana corpus. Will need to be generalized to handle multiple corpora.
 */
module.exports = [
    '$http', 'grammar', '$q',
    function ($http, grammar, $q) {
        var factPromise = $http.get(BASE_URL + 'facts.txt', { timeout: 4000 })
            .then(
            function (data) {
                console.log('Loaded facts.')

                return FactFileParser(data.data, grammar)
            },
            failedLoading
        )

        return $q.all([
            factPromise,
            $http.get(BASE_URL + 'words.txt', { timeout: 4000 })
        ]).then(function(res) {
            console.log('Loaded sentences.')

            let facts = res[0]

            for (let fact of facts) {
                if (fact instanceof Word) {
                    fact.explanation = fact.jp + ' is pronounced "' + fact.getEnglish() + '"'
                }
            }

            let sentenceData = res[1].data

            var factsById = {}

            for (let fact of facts) factsById[fact.toString()] = fact

            return {
                sentences: SentenceFileParser(sentenceData, factsById, grammar),
                facts: facts
            }
        },
            failedLoading)
    }
]
