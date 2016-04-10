/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../js/shared/Inflections';
import Inflection from '../js/shared/Inflection';

import Words from '../js/shared/Words';
import Word from '../js/shared/Word';
import UnstudiedWord from '../js/shared/UnstudiedWord';
import InflectedWord from '../js/shared/InflectedWord';

import { expect } from 'chai';

describe('InflectedWord', function() {
    let regular =
        new Inflection('regular', 'nom', { nom: 'a', imp: 'o', fut: 'x' })

    let irregular =
        new Inflection('irregular', 'nom', { imp: 'i' }).inherit(regular)

    let inflections = new Inflections([ regular, irregular ])
    
    let word = new Word('foo', 'bar').setEnglish('eng')

    let inflectedWord = 
        new InflectedWord('fooa', 'foo', null, 'nom')
            .setEnglish('eng')
            .setInflection(irregular)

    it('gets right ID', () => {
        expect(inflectedWord.getId()).to.equal('fooa@nom');
    })

    it('inflects inherited inflections', () => {
        expect(inflectedWord.inflect('nom').toString()).to.equal('fooa');
        expect(inflectedWord.inflect('fut').toString()).to.equal('foox');
        expect(inflectedWord.inflect('imp').toString()).to.equal('fooi');
    })

    it('inflects', () => {
        let count = 0
        let all: { [s: string]: InflectedWord } = {}
        
        inflectedWord.visitAllInflections((inflection) => {
            all[inflection.form] = inflection
            count++
        }, false)
        
        expect(count).to.equal(3)
        
        expect(all['nom'].toString()).to.equal('fooa')
        expect(all['nom'].getId()).to.equal('fooa@nom')
        expect(all['fut'].toString()).to.equal('foox')
        expect(all['imp'].toString()).to.equal('fooi')
    })

    it('can be retrieved from Words (move to WordsTest)', () => {    
        let words = new Words()
        
        words.add(inflectedWord)
        
        expect(words.get(inflectedWord.getId()).getId()).to.equal(inflectedWord.getId());
    })
})