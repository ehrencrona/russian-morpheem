"use strict";

var Sentence = require('./Sentence')
var typecheck = require('./typecheck')
var _ = require('underscore')

/**
 * Reads a file of sentences. See parseLine for the format.
 */

/**
 * Parses a Japanese sentence (words delimited by spaces) into Words.
 */
function parseSentenceToWords(sentence, wordsById, lineNumber) {
    var words = []

    let pos = 1

    for (let token of sentence.split(' ')) {
        if (!token) {
            pos++
            continue
        }

        let word = wordsById[token]

        if (!word) {
            let sameLetter = _.filter(_.keys(wordsById), (word) => word[0] == token[0])

            let byMatchLength = sameLetter.map((word) => {
                let i;
                
                for (i = 1; i < word.length; i++) {
                    if (word[i] !== token[i]) {
                        break
                    }
                }

                return [ word, i ]
            }).sort((pair1, pair2) => pair2[1] - pair1[1]);

            for (let i = 1; i < byMatchLength.length; i++) {
                if (byMatchLength[i][1] < byMatchLength[i-1][1]) {
                    byMatchLength = byMatchLength.slice(0, i);
                    break
                }
            }

            let split = token.split('@');
            
            let suggestions = byMatchLength.map((match) => match[0]);
            
            if (split[1]) {
                let rightForm = suggestions.filter((word) => {
                    return word.split('@')[1] == split[1]
                })
                
                if (rightForm.length) {
                    suggestions = rightForm
                }
            }

            throw new Error(lineNumber + ': Unknown word "' + token + '" in "' + sentence + '".' + 
                (byMatchLength.length ? ' Did you mean any of ' + suggestions + '?' : '') +
                (split[0].match(/[a-z]/) ? ' Note that the word contains Latin characters' : '') +
                (split[1] && split[1].match(/[а-ё]/) ? ' Note that the form contains Cyrillic characters' : '') 
                + '\n    at (/projects/morpheem-jp/public/corpus/russian/sentences.txt:' + lineNumber + ':' + pos + ')'
            );
        }

        words.push(word)
        
        pos += token.length + 1
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
function parseLineToElements(line, parseSentenceToWords) {
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

    result.english = english.trim()

    return result
}

function parseLine(line, wordsById, grammar, lineNumber) {
    var elements = parseLineToElements(line, (sentence) => parseSentenceToWords(sentence, wordsById, lineNumber))

    var sentence = new Sentence(elements.words)

    // TODO: the IDs of sentences should be persistent after updates of the knowledge base.
    sentence.id = sentence.toString()

    sentence.setEnglish(elements.english)

    for (let tag of elements.tags) {
        let name = tag[0]
        let value = tag[1]

        if (name == 'requires') {
            sentence.requiresFact(grammar(value))
        }
    }
    
    return sentence
}

function expandLine(line, lineNumber) {
    const regex = /\(([^)]+,[^)]+)\)/g;
    let elements = line.split(regex)
    
    if (elements.length == 1) {
        return elements
    }
    else if (elements.length == 5) {
        let ma = elements[1].split(',');
        let na = elements[3].split(',');

        if (ma.length != na.length) {
            throw new Error(lineNumber + ': ' + elements[1] + ' has a different number of words than ' + elements[3]);
        }
        
        let result = []
        
        for (let i = 0; i < ma.length; i++) {
            result.push(elements[0] + ma[i].trim() + elements[2] + na[i].trim() + elements[4])
        }
        
        return result;
    }
    else {
        throw new Error(lineNumber + ': "' + line + '" contains an unexpected number of parenthesized blocks. There should be one in the target language and one in the translation.')
    }
}

module.exports = (data, wordsById, grammar) => {
    typecheck([data, wordsById, grammar], 'string', 'object', 'function')

    var sentences = []

    let lineNumber = 0;

    for (let line of data.split('\n')) {
        lineNumber++;
        
        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        for (let expandedLine of expandLine(line, lineNumber)) {
            sentences.push(parseLine(expandedLine, wordsById, grammar, lineNumber))
        }
    }

    return sentences
}
