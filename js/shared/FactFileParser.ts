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
import InflectableWord from './InflectableWord';
import Inflections from './Inflections';
import Fact from './Fact';
import Facts from './Facts';
import Grammars from './Grammars';

export default function parseFactFile(data, inflections: Inflections, lang: string): Facts {
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

        if (lang == 'ru' && parseResult.word.match(/[a-z]/)) {
            console.error('Warning: ' + parseResult.word + ' contains Latin characters.')
        }

        let wordWithoutStemMark = parseResult.word.replace('--', '')

        if (leftSide.indexOf('unstudied') > 0) {
            return new UnstudiedWord(parseResult.word, parseResult.classifier)
        }
        else {
            return new Word(wordWithoutStemMark, parseResult.classifier)
        }
    }

    function splitRightSide(rightSide) {
        let elements = rightSide.split(',').map((s) => s.trim())

        return elements.map((element) => {
            let split = element.split(':').map((s) => s.trim())
            let tag
            let text

            if (!split[1]) {
                // form undefined means this is the english translation
                return [ null, split[0] ]
            }
            else {
                return [ split[0], split[1] ]
            }
        })
    }

    function parseRightSideOfDefinition(rightSide, word: Word): Fact {
        let fact: Fact = word

        splitRightSide(rightSide).forEach((pair) => {
            let tag = pair[0]
            let text = pair[1]

            if (tag == 'inflect') {
                let inflection = inflections.getInflection(text)

                if (!inflection) {
                    throw new Error('Unknown inflection "' + text + '"'
                        + '\n    at (/projects/morpheem-jp/public/corpus/russian/facts.txt:' + lineIndex + ':1)')
                }
                
                let defaultEnding = inflection.getEnding(inflection.defaultForm)
                let defaultSuffix = defaultEnding.suffix

                if (word.jp.substr(word.jp.length - defaultSuffix.length) != defaultSuffix) {
                    throw new Error(word.jp + ' should end with "' + defaultSuffix + '".');
                }

                let stem = word.jp.substr(0, word.jp.length - defaultSuffix.length)
                let i = defaultEnding.subtractFromStem

                while (i > 0) {
                    if (stem[stem.length-1] != '<') {
                        throw new Error(word.jp + ' seems to be missing one or more <, after "' + stem + '"');
                    }

                    stem = stem.substr(0, stem.length-1)
                    i--
                }

                let iw = new InflectableWord(stem, inflection)
                iw.en = word.getEnglish('')
                
                fact = iw
            }
            else if (tag == 'grammar') {
                var requiredFact = facts.get(text)

                if (!requiredFact) {
                    throw new Error('Unknown required fact "' + text + '" in "' + rightSide + '"')
                }

                word.requiresFact(requiredFact)
            }
            else if (tag == 'tag') {
                facts.tag(fact, text)
            }
            else {
                word.setEnglish(text, tag)
            }
        })
        
        return fact
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
            splitRightSide(rightSide.trim()).forEach((pair) => {
                let tag = pair[0]
                let text = pair[1]
                
                if (!tag) {
                    fact = grammars.get(rightSide.trim())

                    if (!fact) {
                        console.warn('Unknown grammar "' + rightSide.trim() + '"'
                            + '\n    at (/projects/morpheem-jp/public/corpus/russian/facts.txt:' + lineIndex + ':1)')
                    }
                }
                else if (tag == 'tag') {
                    if (fact) {
                        facts.tag(fact, text)
                    }
                }
                else {
                    throw new Error(`Unrecognized attribute "${ tag }"`
                        + '\n    at (/projects/morpheem-jp/public/corpus/russian/facts.txt:' + lineIndex + ':1)')
                }
            })
        }
        else {
            fact = parseLeftSideOfDefinition(leftSide)

            fact = parseRightSideOfDefinition(rightSide, fact)

            fact.line = lineIndex
        }

        if (fact) {
            facts.add(fact)
        }
    }

    return facts
}
