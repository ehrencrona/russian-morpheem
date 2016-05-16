/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflection from '../shared/Inflection';
import Inflections from '../shared/Inflections';
import Word from '../shared/Word';
import UnstudiedWord from '../shared/UnstudiedWord';
import InflectedWord from '../shared/InflectedWord';

import { expect } from 'chai';

let inflections = new Inflections([
    new Inflection('infl', 'nom', null, { nom: 'ium' })
])

describe('Word', function() {
    it('converts unstudied to JSON and back', function () {
        let before = new UnstudiedWord('foo', 'bar').setEnglish('eng')
        let after = InflectedWord.fromJson(before.toJson(), inflections);
        
        expect(after).to.be.instanceOf(UnstudiedWord)
        
        expect(after.classifier).to.equal(before.classifier)
        expect(after.jp).to.equal(before.jp)
        expect(after.getEnglish()).to.equal(before.getEnglish())
    })
    
    it('converts studied to JSON and back', function () {
        let before = new Word('foo', 'bar').setEnglish('eng')
        let after = InflectedWord.fromJson(before.toJson(), inflections);
        
        expect(after).to.be.instanceOf(Word)
        
        expect(after.classifier).to.equal(before.classifier)
        expect(after.jp).to.equal(before.jp)
        expect(after.getEnglish()).to.equal(before.getEnglish())
    })
    
    it('converts inflected to JSON and back', function () {
        let before = new InflectedWord('fooium', null, 'nom')
            .setEnglish('eng')
            .setInflection(inflections.inflections[0])
        let after = InflectedWord.fromJson(before.toJson(), inflections);
        
        expect(after).to.be.instanceOf(InflectedWord)
        
        expect(after.classifier).to.equal(before.classifier)
        expect(after.jp).to.equal(before.jp)
        expect(after.getEnglish()).to.equal(before.getEnglish())
        
        if (after instanceof InflectedWord) {
            expect(after.inflection.id).to.equal(before.inflection.id)
        }
    })
})