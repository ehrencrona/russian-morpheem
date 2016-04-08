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

import Word from './Word';
import UnstudiedWord from './UnstudiedWord';
import InflectedWord from './InflectedWord';
import Inflections from './Inflections';
import Fact from './Fact';
import Facts from './Facts';
import Grammars from './Grammars';

export default function parseFactFile(data, inflections: Inflections) {
    var facts = new Facts()
    var grammars = new Grammars(inflections)

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

    function parseLeftSideOfDefinition(leftSide): Fact {
        let elements = leftSide.split(',').map((s) => s.trim())

        var parseResult = parseWordAndClassifier(elements[0])

        let stemAndEnding = parseResult.word.split('--');
        let inflected = stemAndEnding.length == 2;

        if (parseResult.word.match(/[a-z]/)) {
            console.error('Warning: ' + parseResult.word + ' contains Latin characters.')
        }

        if (leftSide.indexOf('unstudied') > 0) {
            return new UnstudiedWord(parseResult.word, parseResult.classifier)
        }
        else if (inflected) {
            let wordWithoutStemMark = parseResult.word.replace('--', '')

            let stem = stemAndEnding[0]

            return new InflectedWord(wordWithoutStemMark, stem, null, 'n/a')
        } 
        else {
            return new Word(parseResult.word, parseResult.classifier)
        }
    }

    function parseRightSideOfDefinition(rightSide, word) {
        let elements = rightSide.split(',').map((s) => s.trim())

        for (let element of elements) {
            let split = element.split(':').map((s) => s.trim())
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
                let inflection = inflections.getInflection(text)
                
                if (!inflection) {
                    throw new Error('Unknown inflection "' + text + '"')
                }

                if (word.stem === undefined) {
                    throw new Error('Inflected word "' + word.jp + '" should mark end of stem with two dashes.')
                }

                word.setForm(inflection.defaultForm)
                
                let defaultEnding = inflection.getEnding(inflection.defaultForm)
                
                if (word.jp.substr(word.jp.length - defaultEnding.length) != defaultEnding) {
                    throw new Error(word.jp + ' should end with "' + defaultEnding + '".');
                }

                word.setInflection(inflection)
            }
            else if (tag == 'grammar') {
                var requiredWord = grammars.get(text)

                if (!requiredWord) {
                    throw new Error('Unknown required word "' + text + '" in "' + rightSide + '"')
                }

                word.requiresFact(requiredWord)
            }
            else {
                word.setEnglish(text, tag)
            }
        }
    }

    let lineIndex = 0

    for (let line of data.split('\n')) {
        lineIndex++ 
        
        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        let i = line.indexOf(':')

        if (i < 0) {
            throw new Error('Every line should start with the Japanese word followed by colon. "' + line + '" does not.')
        }

        let leftSide = line.substr(0, i)
        let rightSide = line.substr(i + 1)

        let fact;

        if (leftSide == 'grammar') {
            fact = grammars.get(rightSide.trim())

            if (!fact) {
                throw new Error('Unknown grammar "' + rightSide.trim() + '"'
                    + '\n    at (/projects/morpheem-jp/public/corpus/russian/facts.txt:' + lineIndex + ':1)')
            }
        }
        else {
            fact = parseLeftSideOfDefinition(leftSide)

            parseRightSideOfDefinition(rightSide, fact)

            fact.line = lineIndex
            facts.add(fact)
        }
    }

    return facts
}
