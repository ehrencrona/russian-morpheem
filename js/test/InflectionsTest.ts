/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/inflection/Inflections';
import Inflection from '../shared/inflection/Inflection';
import InflectedWord from '../shared/InflectedWord';
import InflectableWord from '../shared/InflectableWord';
import Ending from '../shared/Ending';
import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import Transforms from '../shared/Transforms'

import { expect } from 'chai';

describe('Inflections', function() {
    it('handles JSON conversion', function () {

        let before = new Inflections([            
            new Inflection('regular', 'nom', 'n', 
                parseEndings('nom: а', 'ru', 'n').endings),
            new Inflection('funny', 'nom', 'n', 
                parseEndings('acc: ц', 'ru', 'n').endings),
            new Inflection('irregular', 'nom', 'n', 
                parseEndings('nom: в', 'ru', 'n').endings)
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
            new Inflection('скаж<зать', 'inf', 'v', {
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
            new Inflection('сказать', 'nom', 'v', 
                parseEndings('inf: ать, pastm: ал, pastf: pastm-а', 'ru', 'v').endings)

        let word = new InflectableWord('сказ', inflection)

        expect(word.inflect('pastf').toString()).to.equal('сказала')

        let child = new Inflection('бегать', 'nom', 'v', {}).inherit(inflection)
        word = new InflectableWord('бег', child)

        expect(word.inflect('pastf').toString()).to.equal('бегала')

    })

    it('handles transforms', function () {
        let inflection = 
            new Inflection('adj', 'm', 'adj', 
                parseEndings('m ый', 'ru', 'adj').endings).addTransform(Transforms.get('yToI'))

        let word = new InflectableWord('маленьк', inflection)

        expect(word.getDefaultInflection().toString()).to.equal('маленький')

    })
})