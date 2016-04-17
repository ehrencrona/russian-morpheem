/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../js/shared/Inflections';
import Inflection from '../js/shared/Inflection';

import Facts from '../js/shared/Facts';
import Words from '../js/shared/Words';
import Word from '../js/shared/Word';
import UnstudiedWord from '../js/shared/UnstudiedWord';
import InflectedWord from '../js/shared/InflectedWord';

import { expect } from 'chai';

describe('Facts', function() {
    let inflection =
        new Inflection('regular', 'nom', null, { nom: 'a', imp: 'o' })
            
    let inflections = new Inflections([ inflection ])
    
    let word = new Word('foo', 'bar').setEnglish('eng')
    let inflectedWord = new InflectedWord('fooa', 'foo', null, 'nom')
        .setEnglish('eng')
        .setInflection(inflection)

    let facts = new Facts()
        .add(inflections.getForm('regular@nom'))
        .add(word)
        .add(inflectedWord)
        .add(inflections.getForm('regular@imp'))

    let words = new Words().add(word).add(inflectedWord)

    it('looks up facts by index', () => {
        expect(facts.indexOf(word)).to.equal(1)
    })
    
    it('handles JSON conversion', () => {
        let after = Facts.fromJson(facts.toJson(), inflections, words)

        expect(after.facts[0].getId()).to.equal('regular@nom');

        expect(after.facts[1]).to.instanceOf(Word);
        expect(after.facts[1].getId()).to.equal(word.getId());

        expect(after.facts[2]).to.instanceOf(InflectedWord);
        expect(after.facts[2].getId()).to.equal(inflectedWord.getId());
        
        expect(after.facts[3].getId()).to.equal('regular@imp');
    })
})