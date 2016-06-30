
import parser from '../shared/fact/FactFileParser'
import { factToString } from '../shared/fact/FactFileGenerator'
import factsToString from '../shared/fact/FactFileGenerator'
import { expect } from 'chai';

import Inflections from '../shared/Inflections'
import Inflection from '../shared/Inflection'
import { parseEndings } from '../shared/InflectionsFileParser'

// ぎ:gi, requires: き, grammar: ktog

var inflections = new Inflections()
    
inflections.add(new Inflection('inflection', 'nom', null, 
    parseEndings('nom: a', 'fake').endings))

inflections.add(new Inflection('lastchar', 'nom', null, 
    parseEndings('nom: <a', 'fake').endings))

describe('FactFileParser', function() {
    function test(str) {
        var facts = parser(str, inflections, 'ru')

        expect(factToString(facts.facts[0], facts)).to.equal(str)
    }

    it('parses word and meaning', function () {
        test('word: meaning')         
    })

    it('parses inflected words', function () {
        test('wordd--<a: meaning, inflect: lastchar')
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
})
