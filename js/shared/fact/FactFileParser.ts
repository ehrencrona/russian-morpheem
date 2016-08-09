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

import Word from '../Word'
import InflectableWord from '../InflectableWord'
import Inflections from '../inflection/Inflections'
import InflectionFact from '../inflection/InflectionFact'
import Fact from './Fact'
import Facts from './Facts'
import Phrases from '../phrase/Phrases'
import Grammars from '../Grammars'
import Corpus from '../Corpus'
import MASKS from '../Masks'
import transforms from '../Transforms'
import Transform from '../Transform'
import Phrase from '../phrase/Phrase'
import { ENGLISH_FORMS_HASH } from '../inflection/InflectionForms'

class PhraseFact implements Fact {
    constructor(public id: string) {
        this.id = id
    }

    getId() {
        return this.id
    }

    visitFacts(visitor: (Fact) => any) {
        visitor(this)
    }
}

export function parseFactFile(data, inflections: Inflections, lang: string): Facts {
    let facts = new Facts()
    let grammars = new Grammars(inflections)

    function parseWordAndClassifier(jpWord) {
        let classifier
        let m = jpWord.match(/(.*)\[(.*)\]/)

        let text

        if (m) {
            text = m[1]
            classifier = m[2]
        }
        else {
            text = jpWord
        }

        return {classifier: classifier, word: text}
    }

    function parseLeftSideOfDefinition(leftSide): Word {
        let elements = leftSide.split(',').map((s) => s.trim())

        let parseResult = parseWordAndClassifier(elements[0])

        let stemAndEnding = parseResult.word.split('--');
        let inflected = stemAndEnding.length == 2;

        if (lang == 'ru' && parseResult.word.match(/[a-z]/)) {
            console.error('Warning: ' + parseResult.word + ' contains Latin characters.')
        }

        let wordWithoutStemMark = parseResult.word.replace('--', '')

        return new Word(wordWithoutStemMark, parseResult.classifier)
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
        let en = ''

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

                if (!defaultEnding) {
                    throw new Error(`The inflection ${inflection.id} must have the default form ${inflection.defaultForm}.`)
                }

                let defaultSuffix = defaultEnding.suffix
                let stem = word.jp.substr(0, word.jp.length - defaultSuffix.length)

                inflection.visitTransforms((transform: Transform) => {
                    if (transform.isApplicable(stem, defaultSuffix)) {
                        defaultSuffix = transform.apply(defaultSuffix)
                    }
                })

                if (word.jp.substr(word.jp.length - defaultSuffix.length) != defaultSuffix) {
                    throw new Error(word.jp + ' should end with "' + defaultSuffix + '".');
                }

                let i = defaultEnding.subtractFromStem

                while (i > 0) {
                    if (stem[stem.length-1] != '<') {
                        throw new Error(word.jp + ' seems to be missing one or more <, after "' + stem + '"');
                    }

                    stem = stem.substr(0, stem.length-1)
                    i--
                }

                let iw = new InflectableWord(stem, inflection, word.classifier)
                iw.en = word.en

                fact = iw
            }
            else if (tag == 'grammar') {
                let requiredFact = facts.get(text)

                if (!requiredFact) {
                    throw new Error('Unknown required fact "' + text + '" in "' + rightSide + '"')
                }

                word.requiresFact(requiredFact)
            }
            else if (tag == 'tag') {
                facts.tag(fact, text)

                if (text == 'untranslatable' && (fact instanceof Word || fact instanceof InflectableWord)) {
                    fact.studied = false
                }
            }
            else if (tag == 'pos') {
                word.pos = text
            }
            else if (tag == 'mask') {
                if (fact instanceof InflectableWord) {
                    let mask = MASKS[fact.inflection.pos][text]

                    if (!mask) {
                        throw new Error('Unknown mask "' + text + '" in "' + rightSide + '"')
                    }

                    fact.setMask(mask)
                }
                else {
                    console.error('Attempt to set mask on ' + fact.getId() + '. It is not an inflectable word. Not that the mask tag should be after the inflect tag.')
                }
            }
            else if (ENGLISH_FORMS_HASH[tag]) {
                word.setEnglish(text, tag)
            }
            else if (!tag) {
                if (en) {
                    en += ', '
                }

                en += text

                word.setEnglish(en, tag)
            }
        })
        
        return fact
    }

    let lineIndex = 0

    for (let line of data.split('\n')) {
        lineIndex++ 

        line = line.trim()
        
        if (!line || line.substr(0, 2) == '//') {
            continue
        }

        let i = line.indexOf(':')

        if (i < 0) {
            throw new Error('Every line should start with the Japanese word followed by colon. "' + line + '" does not.')
        }

        let leftSide = line.substr(0, i)
        let rightSide = line.substr(i + 1)

        let fact: Fact;

        if (leftSide == 'grammar') {
            splitRightSide(rightSide.trim()).forEach((pair) => {
                let tag = pair[0]
                let text = pair[1]
                
                if (!tag) {
                    fact = grammars.get(text)

                    if (!fact) {
                        console.warn('Unknown grammar "' + text + '"'
                            + '\n    at (/projects/morpheem-jp/public/corpus/russian/facts.txt:' + lineIndex + ':1)')
                    }

                    if (fact instanceof InflectionFact) {
                        if (fact.inflection.pos == 'v') {
                            facts.tag(fact, 'verb')
                        }
                        if (fact.form.substr(0, 3) == 'acc') {
                            facts.tag(fact, 'accusative')
                        }
                        if (fact.form.substr(0, 3) == 'dat') {
                            facts.tag(fact, 'dative')
                        }
                        if (fact.form.substr(0, 3) == 'gen') {
                            facts.tag(fact, 'genitive')
                        }
                        if (fact.form.substr(0, 5) == 'instr') {
                            facts.tag(fact, 'instrumental')
                        }
                        if (fact.form.substr(0, 4) == 'prep') {
                            facts.tag(fact, 'prepositional')
                        }
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
        else if (leftSide == 'transform') {
            fact = transforms.get(rightSide.trim())

            if (!fact) {
                throw new Error(`Unknown transform "${rightSide}"`)
            }
        }
        else if (leftSide == 'phrase') {
            let phraseId = rightSide.trim()
            
            if (!phraseId || phraseId.indexOf(' ') >= 0) {
                throw new Error(`${phraseId} does not look like a phrase ID.`)
            }

            fact = new PhraseFact(phraseId)
        }
        else {
            let word = parseLeftSideOfDefinition(leftSide)

            fact = parseRightSideOfDefinition(rightSide, word)

        }

        if (fact) {
            facts.add(fact)
        }
    }

    return facts
}

export function resolvePhrases(facts: Facts, phrases: Phrases) {
    facts.facts.forEach((fact) => {
        if (fact instanceof PhraseFact) {
            let phrase = phrases.get(fact.getId())

            if (!phrase) {
                throw new Error(`Unknown phrase ${ fact.getId() }`)
            }

            facts.replace(fact, phrase)
        }
    })
}

export default parseFactFile