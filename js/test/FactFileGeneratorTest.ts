
import { parseFactFile as parser, resolvePhrases } from '../shared/fact/FactFileParser'
import { factToString } from '../shared/fact/FactFileGenerator'
import factsToString from '../shared/fact/FactFileGenerator'
import { expect } from 'chai';

import Inflections from '../shared/inflection/Inflections'
import Inflection from '../shared/inflection/Inflection'
import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import Transforms from '../shared/Transforms'

import Facts from '../shared/fact/Facts'
import Phrase from '../shared/phrase/Phrase'
import Phrases from '../shared/phrase/Phrases'

import InflectableWord from '../shared/InflectableWord'
import Word from '../shared/Word'

describe('FactFileParser', function() {
    var inflections = new Inflections()
        
    inflections.add(new Inflection('inflection', 'nom', null, 
        parseEndings('nom: a', 'fake').endings))

    inflections.add(new Inflection('lastchar', 'nom', null, 
        parseEndings('nom: <a', 'fake').endings))

    inflections.add(new Inflection('yToI', 'm', 'adj', 
        parseEndings('m: ый', 'ru').endings).addTransform(Transforms.get('yToI')))

    let w1: Word, w3: InflectableWord

    w1 = new Word('в', 'loc')
    w3 = new InflectableWord('библиотек', inflections.inflections[0])

    let facts = new Facts()
    facts.add(w1)
    facts.add(w3)

    let phrases = new Phrases()
    phrases.add(new Phrase('phraseId', []))

    function test(str) {
        var facts = parser(str, inflections, 'ru')

        expect(factToString(facts.facts[0], facts)).to.equal(str)

        return facts
    }

    it('parses word and meaning', function () {
        test('word: meaning')         
    })

    it('parses inflected words', function () {
        test('wordd--<a: meaning, inflect: lastchar')
    })

    it('parses English', function () {
        test('word: meaning, pl: meanings')
    })

    it('parses grammar facts', function () {
        test('grammar: inflection@nom')
    })

    it('handles classifiers', function () {
        test('word[type]: meaning')
    })

    it('handles requires', function () {
        let str = 'a: meaning\nb: meaning, grammar: a'

        var facts = parser(str, inflections, 'ru')

        expect(factsToString(facts)).to.equal(str)
    })

    it('handles phrases', function () {
        let str = 'phrase: phraseId'

        var facts = parser(str, inflections, 'ru')

        resolvePhrases(facts, phrases)

        expect(factsToString(facts)).to.equal(str)
    })

    it('parses transformed word', function () {
        test('маленьк--ий: small, inflect: yToI')
    })

    it('parses transform facts', function () {
        test('transform: yToI')
    })
})
