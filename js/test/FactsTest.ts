/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/Inflections';
import Inflection from '../shared/Inflection';

import Facts from '../shared/fact/Facts';
import Words from '../shared/Words';
import Word from '../shared/Word';
import UnstudiedWord from '../shared/UnstudiedWord';
import InflectableWord from '../shared/InflectableWord';
import { parseEndings } from '../shared/InflectionsFileParser'

import { expect } from 'chai';

describe('Facts', function() {
    let inflection =
        new Inflection('regular', 'nom', null, 
            parseEndings('nom: a, imp: o', 'fake').endings)

    let inflections = new Inflections([ inflection ])
    
    let word = new Word('foo', 'bar').setEnglish('eng')
    let inflectableWord = new InflectableWord('foo', inflection)
        .setEnglish('eng')

    let facts = new Facts()
        .add(inflections.getForm('regular@nom'))
        .add(word)
        .add(inflectableWord)
        .add(inflections.getForm('regular@imp'))

    let words = new Words().addWord(word).addInflectableWord(inflectableWord)

    it('looks up facts by index', () => {
        expect(facts.indexOf(word)).to.equal(1)
    })
    
    it('handles JSON conversion', () => {
        let after = Facts.fromJson(facts.toJson(), inflections, words)

        expect(after.facts[0].getId()).to.equal('regular@nom');

        expect(after.facts[1]).to.instanceOf(Word);
        expect(after.facts[1].getId()).to.equal(word.getId());

        expect(after.facts[2]).to.instanceOf(InflectableWord);
        expect(after.facts[2].getId()).to.equal(inflectableWord.getId());

        expect(after.facts[3].getId()).to.equal('regular@imp');
    })
    
    it('can move facts', () => {
        let oldFacts = facts.facts.map((x) => x)
        
        facts.move(oldFacts[1], 3)
        
        expect(facts.facts[2]).to.equal(oldFacts[1])
        expect(facts.facts[0]).to.equal(oldFacts[0])
        expect(facts.facts[1]).to.equal(oldFacts[2])
        expect(facts.facts[3]).to.equal(oldFacts[3])
    })
})