import {
    AdjectiveForm,
    Animateness,
    Aspect,
    Negation,
    PartOfSpeech as PoS,
    Reflexivity
} from '../inflection/Dimensions';
import WORD_FORMS from '../inflection/WordForms'
import Inflection from '../inflection/Inflection'
import Word from '../Word'
import InflectableWord from '../InflectableWord'
import Fact from './Fact'
import AbstractFact from './AbstractFact'
import Facts from './Facts'
import Grammars from '../Grammars'
import Corpus from '../Corpus'
import MASKS from '../Masks'
import TagFact from '../TagFact'
import transforms from '../Transforms'
import Transform from '../Transform'
import Words from '../Words'
import Phrases from '../phrase/Phrases'
import Phrase from '../phrase/Phrase'

import Inflections from '../inflection/Inflections'
import InflectionFact from '../inflection/InflectionFact'
import { POS_BY_NAME, ENGLISH_FORMS } from '../inflection/InflectionForms'

import { AbstractAnyWord, TRANSLATION_INDEX_SEPARATOR } from '../AbstractAnyWord';

class PhraseFact extends AbstractFact {
}

export function parseFactFile(data, inflections: Inflections, lang: string): [Facts,Words] {
    let facts = new Facts()
    let grammars = new Grammars(inflections)
    let later: (() => void)[] = []

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
                return [ split[0], split.slice(1).join(':') ]
            }
        })
    }

    function parseRightSideOfDefinition(rightSide, word: Word): AbstractAnyWord {
        let fact: AbstractAnyWord = word
        let en = ''

        splitRightSide(rightSide).forEach((pair) => {
            let tag = pair[0] as string
            let text = pair[1] as string

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
                    if (transform.isApplicable(stem, defaultEnding)) {
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
                iw.enCount = word.enCount
                
                let inheritWordForm = (inflection: Inflection) => {
                    if (iw.wordForm.isCompatibleWith(inflection.wordForm)) {
                        iw.wordForm.add(inflection.wordForm)
                    }
                    else {
                        console.error('Wanted to assign', inflection.wordForm, 
                            ' to ' + iw.toString() + ' but it had an incompatible form ', iw.wordForm)
                    }

                    inflection.inherits.forEach(inheritWordForm)
                }

                inheritWordForm(inflection)

                fact = iw
            }
            else if (tag == 'tag') {
                // legacy. remove
                if (text == 'perfective') {
                    if (fact instanceof AbstractAnyWord) {
                        (fact as AbstractAnyWord).wordForm.aspect = Aspect.PERFECTIVE
                    }
                }
                else if (text == 'animate') {
                    if (fact instanceof AbstractAnyWord) {
                        (fact as AbstractAnyWord).wordForm.animate = Animateness.ANIMATE
                    }
                }
                else if (text == 'possessive') {
                    if (fact instanceof AbstractAnyWord) {
                        (fact as AbstractAnyWord).wordForm.pos = PoS.POSSESSIVE
                    }
                }
                else {
                    facts.tag(fact.getWordFact(), text)

                    if (text == 'untranslatable' && (fact instanceof Word || fact instanceof InflectableWord)) {
                        fact.studied = false
                    }
                }
            }
            else if (tag == 'derive') {
                let [derivation, derivedId] = text.split(':')
                
                later.push(() => {
                    let derived = words.wordsById[derivedId] || words.inflectableWordsById[derivedId] 
                    
                    if (derived) {
                        words.addDerivedWords(fact.getWordFact(), derivation, derived)
                    }
                    else {
                        throw new Error(`Could not find derived word ${derivedId}.`)
                    }
                })
            }
            else if (tag == 'form') {
                if (WORD_FORMS[text]) {
                    if (fact instanceof AbstractAnyWord) {
                        fact.wordForm.add(WORD_FORMS[text])
                    }
                }
                else {
                    throw new Error(`Unknown word form ${text}.` + 
                        '\n    at (/projects/morpheem-jp/public/corpus/russian/facts.txt:' + lineIndex + ':1)')
                }
            }
            // TODO: legacy. delete once server is updated.
            else if (tag == 'pos') {
                let pos = POS_BY_NAME[text]

                if (!pos) {
                    throw new Error(`Unknown PoS "${text}" for ${word.getId()}.`)
                }

                if (fact instanceof AbstractAnyWord) {
                    fact.wordForm.pos = pos
                }
            }
            else if (tag == 'mask') {
                if (fact instanceof InflectableWord) {
                    let mask = MASKS[fact.inflection.wordForm.pos][text]

                    if (!mask) {
                        throw new Error('Unknown mask "' + text + '" in "' + rightSide + '"')
                    }

                    fact.setMask(mask)
                }
                else {
                    console.error('Attempt to set mask on ' + fact.getId() + 
                        '. It is not an inflectable word. Not that the mask tag should be after the inflect tag.')
                }
            }
            else if (!tag) {
                if (en) {
                    en += ', '
                }

                en += text

                word.setEnglish(en)
            }
            else {
                let translationNumber

                if (tag[tag.length-2] == TRANSLATION_INDEX_SEPARATOR) {
                    translationNumber = parseInt(tag[tag.length-1]) - 1
                    tag = tag.substr(0, tag.length-2)
                }
                else if (tag[tag.length-3] == TRANSLATION_INDEX_SEPARATOR) {
                    translationNumber = parseInt(tag.substr(-2)) - 1
                    tag = tag.substr(0, tag.length-3)
                }

                if (ENGLISH_FORMS[tag] || tag == '') {
                    word.setEnglish(text, tag, translationNumber)
                }
                else {
                    console.error(`Unknown tag ${tag} on line "${rightSide}".`)
                }
            }
        })

        // conversion code. remove
        if (fact instanceof AbstractAnyWord) {
            if (fact.wordForm.pos == PoS.VERB && !fact.wordForm.aspect) {
                fact.wordForm.aspect = Aspect.IMPERFECTIVE
            }

            if (fact.wordForm.pos == PoS.VERB && !fact.wordForm.reflex) {
                fact.wordForm.reflex = Reflexivity.NON_REFLEXIVE
            }

            if (fact.wordForm.pos == PoS.ADJECTIVE && !fact.wordForm.negation) {
                fact.wordForm.negation = Negation.POSITIVE
            }

            if (fact.wordForm.pos == PoS.PRONOUN && fact.toText().substr(0, 2) == 'ни') {
                fact.wordForm.negation = Negation.NEGATIVE
            }

            if (fact.wordForm.pos == PoS.ADJECTIVE && fact.toText().substr(0, 2) == 'не') {
                fact.wordForm.negation = Negation.NEGATIVE
            }
        }
        
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
            splitRightSide(rightSide.trim()).forEach((pair) => {
                let tag = pair[0]
                let text = pair[1]
                
                if (!tag) {
                    if (tag) {
                        throw new Error(`There seem to be two phrase IDs in ${rightSide}.`)
                    }
                    
                    if (!text || text.indexOf(' ') >= 0) {
                        throw new Error(`In ${rightSide}, ${text} does not look like a phrase ID.`)
                    }

                    fact = new PhraseFact(text)
                }
                else if (tag == 'tag') {
                    if (!fact) {
                        throw new Error(`In ${rightSide}, a tag comes before the phrase ID.`)
                    }
                    facts.tag(fact, text)
                }
            })
        }
        else if (leftSide == 'tag') {
            fact = new TagFact(rightSide.trim())
        }
        else {
            let word = parseLeftSideOfDefinition(leftSide)

            fact = parseRightSideOfDefinition(rightSide, word).getWordFact()
        }

        if (fact) {
            facts.add(fact)
        }
    }

    let words = new Words(facts)

    later.forEach(f => f())

    return [ facts, words ]
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