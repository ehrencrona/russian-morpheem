"use strict";

/**
 * Parses a list of facts (words and grammar) that defines the order in which the facts should be learned.
 * The file also serves to define the English translation of words. Resolves to an array consisting of Words,
 * Particles and Grammar.
 *
 * Each line in the file has the following format:
 *
 * 出る: go out, past: went out, inflect:ruverb
 *
 * This defines "出る" with its translation of "go out", specifies the English past and how the word is infected.
 * "ruverb" is used to look up an inflecting function that generates past, negative form etc.
 *
 * See facts.txt for an example.
 */

var Q = require('q')
var fs = require('fs')
var Word = require('./Word')
var UnstudiedWord = require('./UnstudiedWord')
var Inflections = require('./Inflections')
var typecheck = require('./typecheck')
var _ = require('underscore')

module.exports = (fileName, grammar) => {
    typecheck([fileName, grammar], 'string', 'function')

    var facts = []
    var factsById = {}

    function foundFact(fact) {
        // there are also particles being read, which are not facts and don't have a getId
        if (fact.getId) {
            factsById[fact.getId()] = fact
        }

        facts.push(fact)
    }

    function parseWordAndClassifier(jpWord) {
        let classifier
        let m = jpWord.match(/(.*)\[(.*)\]/)

        var text

        if (m) {
            text = m[1]
            classifier = m[2]
        }
        else {
            text = jpWord
        }

        return {classifier: classifier, word: text}
    }

    function parseLeftSideOfDefinition(leftSide) {
        let elements = _.map(leftSide.split(','), (s) => s.trim())

        let Class = (leftSide.indexOf('unstudied') > 0 ? UnstudiedWord : Word)

        var parseResult = parseWordAndClassifier(elements[0])

        return new Class(parseResult.word, parseResult.classifier)
    }

    function parseRightSideOfDefinition(rightSide, word) {
        let elements = _.map(rightSide.split(','), (s) => s.trim())

        for (let element of elements) {
            let split = _.map(element.split(':'), (s) => s.trim())
            let tag
            let text

            if (!split[1]) {
                // form undefined means this is the english translation
                text = split[0]
            }
            else {
                tag = split[0]
                text = split[1]
            }

            if (tag == 'inflect') {
                if (!Inflections[text]) {
                    throw new Error('Unknown inflection "' + text + '"')
                }

                for (let inflection of Inflections[text](word, grammar)) {
                    foundFact(inflection)
                }
            }
            else if (tag == 'requires') {
                var requiredWord = factsById[text]

                if (!requiredWord) {
                    throw new Error('Unknown required word "' + text + '" in "' + rightSide + '"')
                }

                word.requiresFact(requiredWord)
            }
            else if (tag == 'grammar') {
                word.requiresFact(grammar(text))
            }
            else {
                word.setEnglish(text, tag)
            }
        }
    }



    var deferred = Q.defer()

    fs.readFile(fileName, 'utf8', function (err, body) {
        if (err) {
            return deferred.reject(new Error(err))
        }

        for (let line of body.split('\n')) {
            if (!line || line.substr(0, 2) == '//') {
                continue
            }

            let i = line.indexOf(':')

            if (i < 0) {
                new Error('Every line should start with the Japanese word followed by colon. "' + line + '" does not.')
            }

            let leftSide = line.substr(0, i)
            let rightSide = line.substr(i + 1)

            if (leftSide == 'grammar') {
                foundFact(grammar(rightSide.trim()))
            }
            else {
                let word = parseLeftSideOfDefinition(leftSide)

                parseRightSideOfDefinition(rightSide, word, grammar, factsById)

                foundFact(word)
            }
        }

        deferred.resolve(facts)
    })

    return deferred.promise
}
