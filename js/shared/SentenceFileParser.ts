"use strict";

import Sentence from './Sentence';
import Sentences from './Sentences';
import Words from './Words';
import Facts from './Facts';

/**
 * Parses a Japanese sentence (words delimited by spaces) into Words.
 */
function parseSentenceToWords(sentence, words: Words, lineNumber) {
    var result = []

    let pos = 1

    for (let token of sentence.split(' ')) {
        if (!token) {
            pos++
            continue
        }

        let word = words.get(token)

        if (!word) {
            let suggestions = words.getSimilarTo(token);
            let split = token.split('@');

            throw new Error(lineNumber + ': Unknown word "' + token + '" in "' + sentence + '".' + 
                (suggestions.length ? ' Did you mean any of ' + suggestions + '?' : '') +
                (split[0].match(/[a-z]/) ? ' Note that the word contains Latin characters' : '') +
                (split[1] && split[1].match(/[а-ё]/) ? ' Note that the form contains Cyrillic characters' : '') 
                + '\n    at (/projects/morpheem-jp/public/corpus/russian/sentences.txt:' + lineNumber + ':' + pos + ')'
            );
        }

        result.push(word)
        
        pos += token.length + 1
    }

    return result
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
        tags: [],
        words: undefined,
        english: undefined
    }

    if (tags) {
        for (let element of tags.split(',')) {
            let split = element.split(':').map((s) => s.trim())

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

function parseLine(line, words: Words, facts: Facts, lineNumber) {
    var elements = parseLineToElements(line, (sentence) => parseSentenceToWords(sentence, words, lineNumber))
    
    let english = elements.english, tags = elements.tags;

    var sentence = new Sentence(elements.words, line.toString())

    // TODO: the IDs of sentences should be persistent after updates of the knowledge base.
    sentence.id = sentence.toString()

    sentence.setEnglish(english)

    for (let tag of tags) {
        let name = tag[0]
        let value = tag[1]

        if (name == 'requires') {
            sentence.requiresFact(facts.get(value))
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

/**
 * Reads a file of sentences. See parseLine for the format.
 */
export default function parseSentenceFile(data, words: Words, facts: Facts) {
    var sentences = new Sentences()

    let lineNumber = 0;

    for (let line of data.split('\n')) {
        lineNumber++;
        
        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        for (let expandedLine of expandLine(line, lineNumber)) {
            sentences.add(parseLine(expandedLine, words, facts, lineNumber))
        }
    }

    return sentences
}
