"use strict"

var _ = require('underscore')
var Q = require('q')
var fs = require('fs')
var readline = require('readline'),
    stream = require('stream');

var NATIVE_LANG2 = 'ru'
var NATIVE_LANG3 = 'rus'

const DIR = '/projects/morpheem-jp/data'
const SENTENCE_FILE = DIR + '/tatoeba-sentences.csv'
const LINK_FILE = DIR + '/tatoeba-links.csv'

var nativeById = {}
var enById = {}

var sentenceCount = 0

var instream = fs.createReadStream(SENTENCE_FILE);
var outstream = new stream;
outstream.readable = true;
outstream.writable = true;

var rl = readline.createInterface({
    input: instream,
    output: outstream,
    terminal: false
});

rl.on ("error", function (error){
    console.log ("error: " + error);
})
.on ("line", function (line){
    if (!line) {
        return
    }

    var components = line.split('\t')

    var id = parseInt(components[0])
    var lang = components[1]
    var sentence = components[2]

    if (sentence.toLowerCase().indexOf('tatoeba') >= 0) {
        return
    }

    if (lang == 'eng') {
        enById[id] = sentence
    }

    if (lang == NATIVE_LANG3) {
        nativeById[id] = {
            ru: sentence
        }

        sentenceCount++
    }
})
.on('close', () => {
    console.log(sentenceCount + ' ' + NATIVE_LANG3 + ' sentences.')

    fs.readFile(LINK_FILE, function(error, body) {
        if (error) throw new Error(error)

        var sentenceById = {}
        var lines = body.toString().split('\n')

        let translationCount = 0

        _.forEach(lines, function(line) {
            var components = line.split('\t')

            var ruId = components[0]

            var native = nativeById[ruId]

            if (native && enById[components[1]]) {
                if (!native.en) {
                    translationCount++
                }

                native.en = enById[components[1]]
            }
        })

        let ids = Object.keys(nativeById)

        let sentences = ids.map((id) => {
            let res = nativeById[id]

            res.id = id

            return res
        })

        console.log(+ translationCount + ' with translation.')

        fs.writeFile('../../data/tatoeba-sentences-' + NATIVE_LANG2 + '.json', JSON.stringify(sentences),
            function() {
                console.log('done writing')
                process.exit()
            })

    })
})

