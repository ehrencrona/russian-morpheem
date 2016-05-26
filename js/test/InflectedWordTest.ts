/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/Inflections';
import Inflection from '../shared/Inflection';

import Words from '../shared/Words';
import Word from '../shared/Word';
import UnstudiedWord from '../shared/UnstudiedWord';
import InflectedWord from '../shared/InflectedWord';
import { parseEndings } from '../shared/InflectionFileParser'

import { expect } from 'chai';

describe('InflectedWord', function() {
    let regular =
        new Inflection('regular', 'nom', null, 
            parseEndings('nom: a, imp: o, fut: x', 'fake').endings)

    let irregular =
        new Inflection('irregular', 'nom', null, 
            parseEndings('imp: i', 'fake').endings).inherit(regular)

    let inflections = new Inflections([ regular, irregular ])
    
    let word = new Word('foo', 'bar').setEnglish('eng')

    let inflectedWord = 
        new InflectedWord('fooa', null, 'nom')
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