"use strict";

var Q = require('q')
var fs = require('fs')
var Sentence = require('./Sentence')
var typecheck = require('./typecheck')
var _ = require('underscore')

/**
 * Reads a file of sentences. See parseLine for the format.
 */

/**
 * Parses a Japanese sentence (words delimited by spaces) into Words.
 */
function parseSentenceToWords(sentence, wordsById) {
    var words = []

    for (let token of sentence.split(' ')) {
        if (!token) {
            continue
        }

        let word = wordsById[token]

        if (!word) {
            let similar = _.filter(_.keys(wordsById), (word) => word[0] == token[0])

            throw new Error('Unknown word "' + token + '" in "' + sentence + '".' + (similar.length ? ' Did you mean any of ' + similar + '?' : ''))
        }

        words.push(word)
    }

    return words
}

/**
 * Given a line of the form <japanese> (requires: grammar): <english> and function that parses Japanese sentences to Word arrays,
 * return the object
 * {
 *   tags: [ [ 'requires', 'grammar'], ... ]
 *   words: [ ... ]
 *   english: 'English sentence'
 * }
 */
function parseLine(line, parseSentenceToWords) {
    var r = /([^(:]*)(?:\((.*)\))? *:(.*)/

    var m = r.exec(line)

    if (!m) {
        throw new Error('Every line should have the form <japanese> (requires: grammar): <english>. (The requires part is optional). "' + line + '" does not follow this convention.')
    }

    var japanese = m[1]
    var english = m[3]
    var tags = m[2]

    var result = {
        tags: []
    }

    if (tags) {
        for (let element of tags.split(',')) {
            let split = _.map(element.split(':'), (s) => s.trim())

            if (split.length != 2) {
                throw new Error('Each element tagging a sentence should consist of <tag>:<value>, where <tag> is e.g. "requires". The element "' + element + '" does not have a colon.')
            }

            result.tags.push(split)
        }
    }

    result.words = parseSentenceToWords(japanese)

    result.english = english

    return result
}

module.exports = (fileName, wordsById, grammar) => {
    typecheck([fileName, wordsById, grammar], 'string', 'object', 'function')

    var deferred = Q.defer()

    fs.readFile(fileName, 'utf8', function (err, body) {
        if (err) {
            return deferred.reject(new Error(err))
        }

        var sentences = []

        for (let line of body.split('\n')) {
            if (!line || line.substr(0, 2) == '//') {
                continue
            }

            var elements = parseLine(line, (sentence) => parseSentenceToWords(sentence, wordsById, grammar))

            var sentence = new Sentence(elements.words)

            sentence.setEnglish(elements.english)

            for (let tag of elements.tags) {
                let name = tag[0]
                let value = tag[1]

                if (name == 'requires') {
                    sentence.requiresFact(grammar(value))
                }
            }

            sentences.push(sentence)
        }


        deferred.resolve(sentences)
    })

    return deferred.promise
}
