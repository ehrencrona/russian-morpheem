
/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflection from '../shared/inflection/Inflection'
import Inflections from '../shared/inflection/Inflections'
import Word from '../shared/Word'
import Words from '../shared/Words'
import Corpus from '../shared/Corpus'
import Facts from '../shared/fact/Facts'
import Ending from '../shared/Ending'
import Sentences from '../shared/Sentences'
import UnstudiedWord from '../shared/UnstudiedWord'
import InflectableWord from '../shared/InflectableWord'
import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import Phrase from '../shared/phrase/Phrase'

import { expect } from 'chai';

let inflections = new Inflections([
    new Inflection('infl', 'nom', null, 
        parseEndings('nom а, prep е', 'ru', 'n').endings)
])

describe('Phrase', function() {
    let w1, w2: Word, w3: InflectableWord, words: Words, facts: Facts, corpus: Corpus
    
    beforeEach(() => {        
        w1 = new UnstudiedWord('в', 'loc')
        w2 = new UnstudiedWord('в', 'dir')
        w3 = new InflectableWord('библиотек', inflections.inflections[0])
        
        facts = new Facts()

        facts.add(w1)
        facts.add(w2)
        facts.add(w3)

        words = new Words(facts)

        facts.tag(w3, 'location')

        corpus = new Corpus(inflections, words, new Sentences(), facts, 'ru')
    })

    it('converts to str and back', function () {
        function testStr(originalStr: string) {
            let phrase = Phrase.fromString('foo', originalStr, corpus)

            expect(phrase.toString()).to.equal(originalStr)
        }

        testStr('в[loc]@ библиотека@prep')
        testStr('в[dir]@ @prep')
        testStr('в[loc]@ tag:location')
    })

    it('matches', function () {
        let words = [
            w1, w3.inflect('prep')
        ]

        function testMatch(phraseStr: string) {
            let phrase = Phrase.fromString('foo', phraseStr, corpus)

            expect(phrase.match(words)).to.be.not.undefined
            expect(phrase.match(words).length).to.equal(2)
        }

        testMatch('в[loc]@ библиотека@prep')
        testMatch('в[loc]@ @prep')
        testMatch('в[loc]@ tag:location')
    })

})