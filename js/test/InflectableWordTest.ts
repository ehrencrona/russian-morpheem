import { WORD_FORMS } from '../shared/inflection/WordForms';
/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/inflection/Inflections';
import Inflection from '../shared/inflection/Inflection';

import Words from '../shared/Words';
import Word from '../shared/Word';
import InflectedWord from '../shared/InflectedWord';
import InflectableWord from '../shared/InflectableWord';
import { parseEndings } from '../shared/inflection/InflectionsFileParser';
import { PartOfSpeech as PoS } from '../shared/inflection/Dimensions'
import WordForm from '../shared/inflection/WordForm'

import { expect } from 'chai';

describe('InflectableWord', function() {
    let regular =
        new Inflection('regular', 'inf', new WordForm({ pos: PoS.VERB }), 
            parseEndings('inf: a, impr: o, pastm: x', WORD_FORMS['v']).endings)

    let irregular =
        new Inflection('irregular', 'inf', new WordForm({ pos: PoS.VERB }), 
            parseEndings('impr: i', WORD_FORMS['v']).endings).inherit(regular)

    let inflections = new Inflections([ regular, irregular ])
    
    let word = new Word('foo', 'bar').setEnglish('eng')

    let inflectableWord = 
        new InflectableWord('foo', irregular)
            .setEnglish('eng')

    it('gets right ID', () => {
        expect(inflectableWord.getId()).to.equal('fooa');
    })

    it('visits all inflections', () => {
        let count = 0

        inflectableWord.visitAllInflections((visitor) => count++)

        expect(count).to.equal(3);
    })

    it('gets right ID on inflections removing last char', () => {
        let regular =
            new Inflection('regular', 'inf', new WordForm({ pos: PoS.VERB }), 
                parseEndings('inf: <a, 1: b', WORD_FORMS['n']).endings)

        let inflectableWord = 
            new InflectableWord('foo', regular)
                .setEnglish('eng')

        expect(inflectableWord.getId()).to.equal('foa');
        expect(inflectableWord.inflect('1').getId()).to.equal('foa@1');
    })

    it('inflects inherited inflections', () => {
        expect(inflectableWord.inflect('inf').toString()).to.equal('fooa');
        expect(inflectableWord.inflect('pastm').toString()).to.equal('foox');
        expect(inflectableWord.inflect('impr').toString()).to.equal('fooi');
    })

    it('inflects', () => {
        let count = 0
        let all: { [s: string]: InflectedWord } = {}
        
        inflectableWord.visitAllInflections((inflection) => {
            all[inflection.form] = inflection
            count++
        })
        
        expect(count).to.equal(3)
        
        expect(all['inf'].toString()).to.equal('fooa')
        expect(all['inf'].getId()).to.equal('fooa@inf')
        expect(all['pastm'].toString()).to.equal('foox')
        expect(all['impr'].toString()).to.equal('fooi')
    })

    it('can be retrieved from Words (move to WordsTest)', () => {    
        let words = new Words()
        
        words.addInflectableWord(inflectableWord)
        
        let inf = inflectableWord.inflect('inf')
        
        expect(words.get(inf.getId()).getId()).to.equal(inf.getId());
    })

    it('handles masking', () => {
        inflectableWord.setMask((form) => form == 'inf')

        expect(inflectableWord.getDefaultInflection().form).equals('pastm')
    })
})