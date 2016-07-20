
/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflection from '../shared/inflection/Inflection'
import Inflections from '../shared/inflection/Inflections'
import Word from '../shared/Word'
import Words from '../shared/Words'
import Corpus from '../shared/Corpus'
import Facts from '../shared/fact/Facts'
import Ending from '../shared/Ending'
import InflectableWord from '../shared/InflectableWord'
import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import Phrase from '../shared/phrase/Phrase'

import { expect } from 'chai';

let inflections = new Inflections([
    new Inflection('infl', 'nom', 'n', 
        parseEndings('nom а, prep е', 'ru', 'n').endings)
])

describe('Phrase', function() {
    let w1, w2: Word, w3: InflectableWord, words: Words, facts: Facts, corpus: Corpus
    
    w1 = new Word('в', 'loc')
    w2 = new Word('в', 'dir')
    w3 = new InflectableWord('библиотек', inflections.inflections[0])
    
    words = new Words()
    words.addWord(w1)
    words.addWord(w2)
    words.addInflectableWord(w3)

    facts = new Facts()
    facts.add(w3)

    facts.tag(w3, 'location')

    it('converts to str and back', function () {
        function testStr(originalStr: string) {
            let phrase = Phrase.fromString('foo', originalStr, words, inflections)

            expect(phrase.toString()).to.equal(originalStr)
        }

        testStr('в[loc]@ библиотека@prep')
        testStr('в[dir]@ prep')
        testStr('в[loc]@ tag:location')
    })

    it('matches', function () {
        let wordArray = [
            w1, w3.inflect('prep')
        ]

        function testMatch(phraseStr: string) {
            let phrase = Phrase.fromString('foo', phraseStr, words, inflections)

            expect(phrase.match(wordArray, facts)).to.be.not.undefined
            expect(phrase.match(wordArray, facts).length).to.equal(2)
        }

        testMatch('в[loc]@ библиотека@prep')
        testMatch('в[loc]@ prep')
        testMatch('в[loc]@ tag:location')
        testMatch('в[loc]@ noun')
    })

})