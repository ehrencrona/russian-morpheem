
/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflection from '../shared/inflection/Inflection'
import Inflections from '../shared/inflection/Inflections'
import Word from '../shared/Word'
import Words from '../shared/Words'
import Facts from '../shared/fact/Facts'
import Ending from '../shared/Ending'
import Corpus from '../shared/Corpus'
import InflectableWord from '../shared/InflectableWord'
import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import Phrase from '../shared/phrase/Phrase'
import Phrases from '../shared/phrase/Phrases'
import Sentences from '../shared/Sentences'
import PhrasePattern from '../shared/phrase/PhrasePattern'
import PhraseMatch from '../shared/phrase/PhraseMatch'

import { expect } from 'chai';

let mascInflection =
    new Inflection('m', 'nom', 'n', 
        parseEndings('nom , acc , gen и, genpl ах, prep е', 'ru', 'n').endings)

let femInflection =
    new Inflection('f', 'nom', 'n', 
        parseEndings('nom а, acc у, gen и, pl ы, genpl ах, prep е', 'ru', 'n').endings)

let inflections = new Inflections([
    femInflection,
    new Inflection('adj', 'm', 'adj', 
        parseEndings('m ий, adv о, genpl ах, gen а', 'ru', 'adj').endings),
    mascInflection
])

describe('Phrase', function() {
    let w1, comma, w2: Word, w3, w4, w5: InflectableWord, words: Words, facts: Facts
    
    w1 = new Word('в', 'loc')
    w2 = new Word('в', 'dir')
    w3 = new InflectableWord('библиотек', femInflection)

    w4 = new InflectableWord('я', mascInflection)
    w5 = new InflectableWord('хорош', inflections.inflections[1])
    w5.setEnglish('good')

    comma = new Word(',')

    words = new Words()
    words.addWord(w1)
    words.addWord(w2)
    words.addInflectableWord(w3)
    words.addInflectableWord(w4)
    words.addInflectableWord(w5)

    facts = new Facts()
    facts.add(w2)
    facts.add(w3)
    facts.add(w4)
    facts.add(w5)

    facts.tag(w4, 'animate')
    facts.tag(w3, 'location')

    let corpus = new Corpus(inflections, words, new Sentences(), facts, new Phrases(), 'ru')

    it('cant reproduce a bug', () => {
        let shouldMatch = [
            w4.inflect('acc'), w4.inflect('gen')
        ]

        let shouldNotMatch = [
            w1, w2, w4.inflect('acc')
        ]

        let phrase = Phrase.fromString('foo', 'noun@acc+ noun@gen+', 'English', words, inflections)
        phrase.setCorpus(corpus)

        expect(phrase.match({ words: shouldNotMatch, facts: facts })).to.be.undefined
        expect(phrase.match({ words: shouldMatch, facts: facts }).words.length).to.equal(2)
    })

    it('handles phrase matches', () => {
        let corpus = Corpus.createEmpty('ru')

        corpus.facts = facts

        let np = new Phrase('np', [
            PhrasePattern.fromString('noun@nominative', '[someone]', words, inflections) 
        ])

        corpus.phrases.add(np)

        let ap = new Phrase('ap', [
            PhrasePattern.fromString('хороший@ phrase:np@genitive#location', '[someone]', words, inflections) 
        ])

        corpus.phrases.add(ap)

        expect(np.match({ words: [ w5.inflect('m'), w3.inflect('nom') ], facts: facts }).words.length).to.equal(1)

        expect(ap.match({ words: [ w5.inflect('genpl'), w3.inflect('genpl') ], facts: facts }).words.length).to.equal(2)

        // wrong case
        expect(ap.match({ words: [ w5.inflect('genpl'), w3.inflect('pl') ], facts: facts })).to.be.undefined

        // wrong tag
        expect(ap.match({ words: [ w5.inflect('genpl'), w4.inflect('genpl') ], facts: facts })).to.be.undefined
    })

    it('translates phrase matches', () => {
        let corpus = Corpus.createEmpty('ru')

        corpus.facts = facts

        let np = new Phrase('np', [
            PhrasePattern.fromString('noun@nominative', 'foobar', words, inflections) 
        ])

        corpus.phrases.add(np)

        let ap = new Phrase('ap', [
            PhrasePattern.fromString('хороший@ phrase:np@genitive#location', '(2) (1)', words, inflections) 
        ])

        corpus.phrases.add(ap)
        
        let xp = new Phrase('xp', [
            PhrasePattern.fromString('phrase:ap', '(1)', words, inflections) 
        ])

        corpus.phrases.add(xp)

        let m = xp.match({ words: [ w5.inflect('genpl'), w3.inflect('genpl') ], facts: facts })

        expect(m.words[0].wordMatch).to.be.instanceof(PhraseMatch)
        expect(m.words[0].childMatch).to.not.be.null

        expect(m.pattern.getEnglishFragments().map(f => f.en(m)).join(' ')).to.equal('foobar good')
    })

    it('converts to str and back', function () {
        let np = new Phrase('np', [
            PhrasePattern.fromString('noun@nominative', '[someone]', words, inflections) 
        ])

        corpus.phrases.add(np)

        function testStr(originalStr: string, becomesStr?: string) {
            let phrase = Phrase.fromString('foo', originalStr, 'English', words, inflections)

            phrase.setCorpus(corpus)

            expect(phrase.patterns.map(p => p.toString()).join(',')).to.equal(becomesStr || originalStr )
        }

        testStr('в[loc]@ библиотека@prep')
        testStr('в[loc]@ я|библиотека@prepositional')
        testStr('в[loc]@ я|библиотека@')
        testStr('в[dir]@ prep')
        testStr('в[loc]@ tag:location', 'в[loc]@ #location')
        testStr('в[loc]@ #location')
        testStr('в[loc]@ phrase:np')
        testStr('в[loc]@ phrase:np@gen')
        testStr('в[loc]@ phrase:np@gen#location')
        testStr('в[loc]@ phrase:np#location')
        testStr('noun prep')
        testStr('noun @prep!', 'noun prep')
        testStr('noun@+ @prep+', 'noun @prep+')
        testStr('noun@! @prep+')
        testStr('noun@? @prep?')
        testStr('noun@* @prep*')
    })

    it('respects quantifiers', function () {
        let shouldMatch = [
            w4.inflect('nom'), w5.inflect('adv')
        ]

        let shouldNotMatch = [
            w4.inflect('nom'), w3
        ]

        let phrase = Phrase.fromString('foo', '#animate adjective@adv+', 'English', words, inflections)
        phrase.setCorpus(corpus)

        expect(phrase.match({ words: shouldMatch, facts: facts }).words.length).to.equal(2)

        expect(phrase.match({ words: shouldNotMatch, facts: facts })).to.be.undefined
    })

    it('fragments patterns correctly', () => {
        let pattern = PhrasePattern.fromString('verb@+ @dative+ @accusative+', 'verb@+ [someone] [something]', words, inflections)
        
        expect(pattern.getEnglishFragments().length).to.equal(3)
    })

    it('any does not match across phrase boundaries', () => {
        let withComma = [
            w1, comma, w3.inflect('prep')
        ]

        let withoutComma = [
            w1, w2, w3.inflect('prep')
        ]

        let phrase = Phrase.fromString('foo', 'в[loc]@ any библиотека@prep', 'English', words, inflections)
        phrase.setCorpus(corpus)

        expect(phrase.match({ words: withoutComma, facts: facts })).to.be.not.undefined
        expect(phrase.match({ words: withComma, facts: facts })).to.be.undefined
    })

    it('matches', function () {
        let wordArray = [
            w1, w3.inflect('prep')
        ]

        function testMatch(phraseStr: string, length: number, isCanonicalForm?: boolean) {
            let phrase = Phrase.fromString('foo', phraseStr, 'English', words, inflections)

            phrase.setCorpus(corpus)

            if (isCanonicalForm != null && isCanonicalForm) {
                expect(phrase.toString()).to.equal(phraseStr)
            }

            expect(phrase.match({ words: wordArray, facts: facts })).to.be.not.undefined
            expect(phrase.match({ words: wordArray, facts: facts }).words.length).to.equal(length)
        }

        testMatch('в[loc]@', 1)
        testMatch('в[loc]@ библиотека@prep', 2)
        testMatch('в[loc]@ я|библиотека@prepositional', 2)
        testMatch('в[loc]@ библиотека@', 2)
        testMatch('в[loc]@ я|библиотека', 2, false)
        testMatch('в[loc]@ библиотека', 2, false)
        testMatch('в[loc]@ prep', 2)
        testMatch('в[loc]@ #location', 2)
        testMatch('в[loc]@ noun+', 2)
        testMatch('в[loc]@ noun@prepositional+', 2)
        testMatch('в[loc]@ noun@prepositional!', 2)
        testMatch('в[loc]@ noun@prep+', 2)

        testMatch('в[loc]@ any noun@prep+', 2)

        testMatch('noun@prep+', 1)
    })

})