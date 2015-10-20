"use strict";

var Q = require('q')
var fs = require('fs')

var SentenceFileParser = require('../shared/SentenceFileParser')
var typecheck = require('../shared/typecheck')

module.exports = (fileName, wordsById, grammar) => {
    typecheck([fileName, wordsById, grammar], 'string', 'object', 'function')

    var deferred = Q.defer()

    fs.readFile(fileName, 'utf8', function (err, body) {
        if (err) {
            return deferred.reject(new Error(err))
        }

        deferred.resolve(SentenceFileParser(body, wordsById, grammar))
    })

    return deferred.promise
}
