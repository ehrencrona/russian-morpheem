/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/inflection/Inflections';
import Inflection from '../shared/inflection/Inflection';
import InflectedWord from '../shared/InflectedWord';
import InflectableWord from '../shared/InflectableWord';
import Ending from '../shared/Ending';
import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import Transforms from '../shared/Transforms'
import { PartOfSpeech as PoS } from '../shared/inflection/Dimensions'
import WordForm from '../shared/inflection/WordForm'
import WORD_FORMS from '../shared/inflection/WordForms'

import { expect } from 'chai';

describe('Inflections', function() {
    it('handles JSON conversion', function () {

        let before = new Inflections([            
            new Inflection('regular', 'nom', new WordForm({ pos: PoS.NOUN }), 
                parseEndings('nom: а', WORD_FORMS['n']).endings),
            new Inflection('funny', 'nom', new WordForm({ pos: PoS.NOUN }), 
                parseEndings('acc: ц', WORD_FORMS['n']).endings),
            new Inflection('irregular', 'nom', new WordForm({ pos: PoS.NOUN }), 
                parseEndings('nom: в', WORD_FORMS['n']).endings)
        ])

        before.inflections[2].inherit(before.inflections[0]);
        before.inflections[2].inherit(before.inflections[1]);
        
        let after = new Inflections().fromJson(before.toJson());
         
        expect(after.inflections.length).to.equal(3);

        expect(after.inflections[0].id).to.equal('regular');
        expect(after.inflections[0].defaultForm).to.equal('nom');

        expect(after.inflections[2].inherits[0].id).to.equal('regular');
        expect(after.inflections[2].inherits[1].id).to.equal('funny');
    })

    it('handles inflections removing characters', function () {
        let inflection = 
            new Inflection('скаж<зать', 'inf', new WordForm({ pos: PoS.VERB }), {
                    inf: new Ending('зать', null, 1), 
                    1: new Ending('у', null, 0), 
                    past: new Ending('зал', null, 1), 
                })

        let word = new InflectableWord('скаж', inflection)

        expect(word.getId()).to.equal('сказать')

        let past = word.inflect('past')

        expect(past.toString()).to.equal('сказал')
        expect(past.getId()).to.equal('сказать@past')

        let inf = word.inflect('inf')

        expect(inf.toString()).to.equal('сказать')
        expect(inf.getId()).to.equal('сказать@inf')

        let oneFromPast = word.inflect('1')

        expect(oneFromPast.toString()).to.equal('скажу')
        expect(oneFromPast.getId()).to.equal('сказать@1')

        let oneFromInf = word.inflect('1')

        expect(oneFromInf.toString()).to.equal('скажу')
        expect(oneFromInf.getId()).to.equal('сказать@1')
    })

    it('handles relative inflections', function () {
        let inflection = 
            new Inflection('сказать', 'nom', new WordForm({ pos: PoS.VERB }), 
                parseEndings('inf: ать, pastm: ал, pastf: pastm-а', WORD_FORMS['v']).endings)

        let word = new InflectableWord('сказ', inflection)

        expect(word.inflect('pastf').toString()).to.equal('сказала')

        let child = new Inflection('бегать', 'nom', new WordForm({ pos: PoS.VERB }), {}).inherit(inflection)
        word = new InflectableWord('бег', child)

        expect(word.inflect('pastf').toString()).to.equal('бегала')

    })

    it('handles transforms', function () {
        let inflection = 
            new Inflection('adj', 'm', new WordForm({ pos: PoS.ADJECTIVE }), 
                parseEndings('m ый', WORD_FORMS['adj']).endings).addTransform(Transforms.get('yToI'))

        let word = new InflectableWord('маленьк', inflection)

        expect(word.getDefaultInflection().toString()).to.equal('маленький')

    })
})