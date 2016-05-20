/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/Inflections';
import Inflection from '../shared/Inflection';
import InflectedWord from '../shared/InflectedWord';

import { expect } from 'chai';

describe('Inflections', function() {
    it('handles JSON conversion', function () {

        let before = new Inflections([            
            new Inflection('regular', 'nom', null, { nom: '-a' }),
            new Inflection('irregular', 'nom', null, { nom: '-b' })
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
            new Inflection('скаж<зать', 'nom', null, 
                { inf: '<зать', 1: 'у', past: '<зал', })

        let word = new InflectedWord('скаж<зать', null, 'inf').setInflection(inflection)

        expect(word.getId()).to.equal('сказать@inf')
        expect(word.toString()).to.equal('сказать')

        let past = inflection.inflect(word, 'past')

        expect(past.toString()).to.equal('сказал')
        expect(past.getId()).to.equal('сказать@past')

        let inf = past.inflect('inf')

        expect(inf.toString()).to.equal('сказать')
        expect(inf.getId()).to.equal('сказать@inf')

        let oneFromPast = past.inflect('1')

        expect(oneFromPast.toString()).to.equal('скажу')
        expect(oneFromPast.getId()).to.equal('сказать@1')

        let oneFromInf = past.inflect('1')

        expect(oneFromInf.toString()).to.equal('скажу')
        expect(oneFromInf.getId()).to.equal('сказать@1')
    })
})