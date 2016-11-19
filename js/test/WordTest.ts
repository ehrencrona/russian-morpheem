import { WORD_FORMS } from '../shared/inflection/WordForms';
/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflection from '../shared/inflection/Inflection'
import Inflections from '../shared/inflection/Inflections'
import Word from '../shared/Word'
import Ending from '../shared/Ending'
import InflectableWord from '../shared/InflectableWord'
import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import { PartOfSpeech as PoS } from '../shared/inflection/Dimensions'

import { expect } from 'chai';

let inflections = new Inflections([
    new Inflection('infl', 'nom', null, parseEndings('nom: ium', WORD_FORMS['pron']).endings)
])

describe('Word', function() {
    it('converts unstudied to JSON and back', function () {
        let before = new Word('foo', 'bar').setEnglish('eng')
        before.wordForm.pos = PoS.VERB

        let after = Word.fromJson(before.toJson(), inflections);
        
        expect(after).to.be.instanceOf(Word)
        
        expect(after.classifier).to.equal(before.classifier)
        expect(after.jp).to.equal(before.jp)
        expect(after.wordForm.pos).to.equal(before.wordForm.pos)
        expect(after.getEnglish()).to.equal(before.getEnglish())
    })
    
    it('converts studied to JSON and back', function () {
        let before = new Word('foo', 'bar').setEnglish('eng')
        let after = Word.fromJson(before.toJson(), inflections);

        expect(after).to.be.instanceOf(Word)

        expect(after.classifier).to.equal(before.classifier)
        expect(after.jp).to.equal(before.jp)
        expect(after.getEnglish()).to.equal(before.getEnglish())
    })
    
    it('converts inflectable to JSON and back', function () {
        let before = new InflectableWord('foo', inflections.inflections[0])
            .setEnglish('eng')
            .setEnglish('engpl', 'pl')
            .setClassifier('classified')

        let after = InflectableWord.fromJson(before.toJson(), inflections);
        
        expect(after).to.be.instanceOf(InflectableWord)
        
        expect(after.classifier).to.equal(before.classifier)
        expect(after.stem).to.equal(before.stem)
        expect(after.getEnglish()).to.equal(before.getEnglish())
        expect(after.getEnglish('pl')).to.equal(before.getEnglish('pl'))
        expect(after.inflection.id).to.equal(before.inflection.id)
    })
})