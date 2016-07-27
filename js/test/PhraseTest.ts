
/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflection from '../shared/inflection/Inflection'
import Inflections from '../shared/inflection/Inflections'
import Word from '../shared/Word'
import Words from '../shared/Words'
import Facts from '../shared/fact/Facts'
import Ending from '../shared/Ending'
import InflectableWord from '../shared/InflectableWord'
import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import Phrase from '../shared/phrase/Phrase'

import { expect } from 'chai';

let inflections = new Inflections([
    new Inflection('infl', 'nom', 'n', 
        parseEndings('nom а, prep е', 'ru', 'n').endings),
    new Inflection('adj', 'm', 'adj', 
        parseEndings('m ий, adv о', 'ru', 'adj').endings)
])

describe('Phrase', function() {
    let w1, w2: Word, w3, w4, w5: InflectableWord, words: Words, facts: Facts
    
    w1 = new Word('в', 'loc')
    w2 = new Word('в', 'dir')
    w3 = new InflectableWord('библиотек', inflections.inflections[0])

    w4 = new InflectableWord('я', inflections.inflections[0])
    w5 = new InflectableWord('хорош', inflections.inflections[1])

    words = new Words()
    words.addWord(w1)
    words.addWord(w2)
    words.addInflectableWord(w3)

    facts = new Facts()
    facts.add(w2)
    facts.add(w3)
    facts.add(w4)
    facts.add(w5)

    facts.tag(w4, 'animate')
    facts.tag(w3, 'location')
/*
    it('converts to str and back', function () {
        function testStr(originalStr: string) {
            let phrase = Phrase.fromString('foo', originalStr, 'English', words, inflections)

            expect(phrase.toString()).to.equal(originalStr)
        }

        testStr('в[loc]@ библиотека@prep')
        testStr('в[dir]@ @prep')
        testStr('в[loc]@ tag:location')
    })

    it('respects quantifiers', function () {
        let shouldMatch = [
            w4.inflect('nom'), w5.inflect('adv')
        ]

        let shouldNotMatch = [
            w4.inflect('nom'), w3
        ]

        let phrase = Phrase.fromString('foo', 'tag:animate adjective@adv+', 'English', words, inflections)

        expect(phrase.match(shouldMatch, facts).words.length).to.equal(2)

        expect(phrase.match(shouldNotMatch, facts)).to.be.undefined
    })
*/

    it('matches', function () {
        let wordArray = [
            w1, w3.inflect('prep')
        ]

        function testMatch(phraseStr: string, length: number) {
            let phrase = Phrase.fromString('foo', phraseStr, 'English', words, inflections)

            expect(phrase.match(wordArray, facts)).to.be.not.undefined
            expect(phrase.match(wordArray, facts).words.length).to.equal(length)
        }

/*
        testMatch('в[loc]@ библиотека@prep', 2)
        testMatch('в[loc]@ библиотека@', 2)
        testMatch('в[loc]@ библиотека', 2)
        testMatch('в[loc]@ prep', 2)
        testMatch('в[loc]@ tag:location', 2)
        testMatch('в[loc]@ noun+', 2)
        testMatch('в[loc]@ noun@prep+', 2)
        */
        testMatch('в[loc]@ any noun@prep+', 2)
        
        testMatch('noun@prep+', 1)
    })

})