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

        token = token.replace(/_/g, ' ')

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
    var tags = m[2]
    var english = m[3]

    var result = {
        tags: [],
        words: undefined,
        english: undefined,
        author: undefined
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

function parseLine(line, words: Words, facts: Facts, lineNumber: number, sentenceIndex: number) {
    var elements = parseLineToElements(line, (sentence) => parseSentenceToWords(sentence, words, lineNumber))
    
    let english = elements.english, tags = elements.tags;
    var sentence = new Sentence(elements.words, Math.max(sentenceIndex, lineNumber-1))

    sentence.setEnglish(english)

    for (let tag of tags) {
        let name = tag[0]
        let value = tag[1]

        if (name == 'requires') {
            sentence.requiresFact(facts.get(value))
        }

        if (name == 'author') {
            sentence.author = value
        }
    }

    return sentence
}

/**
 * Reads a file of sentences. See parseLine for the format.
 */
export default function parseSentenceFile(data, words: Words, facts: Facts): Sentences {
    var sentences = new Sentences()

    let lineNumber = 0;
    let sentenceIndex = 0;

    for (let line of data.split('\n')) {
        lineNumber++;
        
        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        sentences.add(parseLine(line, words, facts, lineNumber, sentenceIndex++))
    }

    return sentences
}
