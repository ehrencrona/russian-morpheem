"use strict";

import Sentence from './Sentence';
import Sentences from './Sentences';
import Words from './Words';
import Word from './Word';
import Facts from './fact/Facts';
import Phrases from './phrase/Phrases'

/**
 * Parses a Japanese sentence (words delimited by spaces) into Words.
 */
function parseSentenceToWords(sentence, words: Words, lineNumber): Word[] {
    var result = []

    let pos = 1

    for (let token of sentence.split(' ')) {
        if (!token) {
            pos++
            continue
        }

        token = token.replace(/_/g, ' ')

        let word: Word = words.get(token)

        if (!word) {
            let suggestions = words.getSimilarTo(token)
            let split = token.split('@')

            throw new Error(lineNumber + ': Unknown word "' + token + '" in "' + sentence + '".' + 
                (suggestions.length ? ' Did you mean any of ' + suggestions + '?' : '') +
                (split[0].match(/[a-z]/) ? ' Note that the word contains Latin characters' : '') +
                (split[1] && split[1].match(/[а-ё]/) ? ' Note that the form contains Cyrillic characters' : '') 
                + '\n    at (/projects/morpheem-jp/public/corpus/russian/sentences.txt:' + lineNumber + ':' + pos + ')'
            )
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
function parseLineToElements(line, parseSentenceToWords, lineNumber) {
    var r = /((\d+) )?([^(:]*)(?:\((.*)\))? *:(.*)/

    var m = r.exec(line)

    if (!m) {
        throw new Error('Every line should have the form <japanese> (requires: grammar): <english>. (The requires part is optional). "' + line + '" does not follow this convention.'
            + '\n    at (/projects/morpheem-jp/public/corpus/russian/sentences.txt:' + lineNumber + ':1)')
    }

    var id = m[2] ? parseInt(m[2]) : null
    var japanese = m[3]
    var tags = m[4]
    var english = m[5]

    japanese = japanese.replace(/\[colon\]/g, ':')

    var result = {
        tags: [],
        words: undefined,
        english: undefined,
        author: undefined,
        id: id
    }

    if (tags) {
        for (let element of tags.split(',')) {
            let split = element.split(':').map((s) => s.trim())

            if (split.length != 2) {
                throw new Error(`Each element tagging a sentence should consist of <tag>:<value>, where <tag> is e.g. "phrase". The element "${element}" on line ${lineNumber} does not have a colon.`)
            }

            result.tags.push(split)
        }
    }

    result.words = parseSentenceToWords(japanese)

    result.english = english.trim()

    return result
}

function parseLine(line, words: Words, phrases: Phrases, lineNumber: number, sentenceIndex: number) {
    var elements = parseLineToElements(line, (sentence) => parseSentenceToWords(sentence, words, lineNumber), lineNumber)
    
    let english = elements.english, tags = elements.tags;

    let id = elements.id
    
    if (!id) {
        id = Math.max(sentenceIndex, lineNumber-1)
    }

    if (!elements.words[elements.words.length-1].isPunctuation()) {
        let fullStop = words.get('.')

        if (fullStop) {
            elements.words.push(fullStop)
        }
    }

    var sentence = new Sentence(elements.words, id)

    sentence.setEnglish(replaceShortWithLongDashes(english))

    for (let tag of tags) {
        let name = tag[0]
        let value = tag[1]

        if (name == 'author') {
            sentence.author = value
        }

        if (name == 'phrase') {
            let phrase = phrases.get(value)

            if (!phrase) {
                throw new Error(`Phrase "${value}", referenced on line ${line}, was not found."`)
            }

            sentence.addPhrase(phrase)
        }
    }

    return sentence
}

/**
 * Reads a file of sentences. See parseLine for the format.
 */
export default function parseSentenceFile(data, words: Words, phrases: Phrases): Sentences {
    var sentences = new Sentences()

    let lineNumber = 0;
    let sentenceIndex = 0;

    for (let line of data.split('\n')) {
        lineNumber++;
        
        line = line.trim()

        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        sentences.add(parseLine(line, words, phrases, lineNumber, sentenceIndex++))
    }

    return sentences
}

function replaceShortWithLongDashes(english: string) {
    let r = /(^| )[-–] [A-Z]/g;

    let m;

    while (!!(m = r.exec(english))) {
        let index = m.index + m[1].length
        english = english.substr(0, index) + '—' + english.substr(index+1)
    }

    return english
}    

