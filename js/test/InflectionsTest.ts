/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/Inflections';
import Inflection from '../shared/Inflection';

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
})