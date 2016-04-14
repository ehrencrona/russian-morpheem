import parser from '../js/shared/FactFileParser'

import { expect } from 'chai';

import Word from '../js/shared/Word'
import Grammar from '../js/shared/Grammar'
import Inflections from '../js/shared/Inflections'
import Inflection from '../js/shared/Inflection'

// ぎ:gi, requires: き, grammar: ktog

var inflections = new Inflections()
    
inflections.add(new Inflection('inflection', 'nom', { nom: 'a'}))

describe('FactFileParser', function() {
    it('parses word and meaning', function () {
        var facts = parser('word:meaning', inflections)
        let word = facts.facts[0]
        
        expect(word.toString()).to.equal('word')

        expect(word).to.be.instanceOf(Word)

        if (word instanceof Word) {
            expect(word.getEnglish()).to.equal('meaning')
        }
    })
    
    it('parses grammar facts', function () {
        var facts = parser('grammar:inflection@nom', inflections)
        let fact = facts.facts[0]
        
        expect(fact).to.be.instanceOf(Grammar)

        if (fact instanceof Grammar) {
            expect(fact.id).to.equal('inflection@nom')
        }
    })

    it('handles classifiers', function () {
        var facts = parser('word[type]:meaning', inflections)
        let word = facts.facts[0]
        
        expect(word).to.be.instanceOf(Word)

        if (word instanceof Word) {
            expect(word.jp).to.equal('word')
            expect(word.classifier).to.equal('type')
        }
    })

    it('handles requires', function () {
        var facts = parser('a:meaning\nb:meaning, grammar: a', inflections)

        let a = facts.facts[0]
        let b = facts.facts[1]

        expect(a).to.be.instanceOf(Word)
        expect(b).to.be.instanceOf(Word)

        if (a instanceof Word && b instanceof Word) {
            expect(b.required[0]).to.equal(a)
        }
    })
})
