"use strict";

var Q = require('q')
var fs = require('fs')
var InflectionFileParser = require('../shared/InflectionFileParser')
var typecheck = require('../shared/typecheck')

module.exports = (fileName) => {
    typecheck([fileName], 'string')

    var deferred = Q.defer()

    fs.readFile(fileName, 'utf8', function (err, body) {
        if (err) {
            return deferred.reject(new Error(err))
        }

        deferred.resolve(InflectionFileParser(body))
    })

    return deferred.promise
}
