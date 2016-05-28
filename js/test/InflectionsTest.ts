/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/Inflections';
import Inflection from '../shared/Inflection';
import InflectedWord from '../shared/InflectedWord';
import InflectableWord from '../shared/InflectableWord';
import Ending from '../shared/Ending';
import { parseEndings } from '../shared/InflectionFileParser'

import { expect } from 'chai';

describe('Inflections', function() {
    it('handles JSON conversion', function () {

        let before = new Inflections([            
            new Inflection('regular', 'nom', null, 
                parseEndings('nom: a', 'fake').endings),
            new Inflection('irregular', 'nom', null, 
                parseEndings('nom: b', 'fake').endings)
        ])

        before.inflections[1].inherit(before.inflections[0]);
        
        let after = Inflections.fromJson(before.toJson());
         
        expect(after.inflections.length).to.equal(2);

        expect(after.inflections[0].id).to.equal('regular');
        expect(after.inflections[0].defaultForm).to.equal('nom');

        expect(after.inflections[1].inherits.id).to.equal('regular');
    })

    it('handles inflections removing characters', function () {
        let inflection = 
            new Inflection('скаж<зать', 'nom', null, {
                    inf: new Ending('зать', null, 1), 
                    1: new Ending('у', null, 0), 
                    past: new Ending('зал', null, 1), 
                })

        let word = new InflectableWord('скаж', inflection)

        expect(word.getId()).to.equal('сказать@inf')
        expect(word.toString()).to.equal('сказать')

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
            new Inflection('сказать', 'nom', null, 
                parseEndings('inf: ать, pastm: ал, pastf: pastm-а', 'fake').endings)

        let word = new InflectableWord('сказ', inflection)

        expect(word.inflect('pastf').toString()).to.equal('сказала')

        let child = new Inflection('бегать', 'nom', null, {}).inherit(inflection)
        word = new InflectableWord('бег', child)

        expect(word.inflect('pastf').toString()).to.equal('бегала')

    })})