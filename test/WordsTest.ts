/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflection from '../js/shared/Inflection';
import Inflections from '../js/shared/Inflections';
import Word from '../js/shared/Word';
import Words from '../js/shared/Words';
import UnstudiedWord from '../js/shared/UnstudiedWord';
import InflectedWord from '../js/shared/InflectedWord';

import { expect } from 'chai';

let inflections = new Inflections([
    new Inflection('infl', 'nom', null, { nom: 'er', past1: 'ais', past2: 'ais' })
])

describe('Words', function() {
    let w1 = new UnstudiedWord('foo', 'bar').setEnglish('eng')
    let w2 = new Word('fooo', 'bar').setEnglish('eng')
    let w3 = new InflectedWord('passer', 'pass', null, 'nom')
        .setEnglish('eng')
        .setInflection(inflections.inflections[0])

    let words = new Words().add(w1).add(w2).add(w3)

    it('retrieves all word forms', function () {
        expect(words.get('passer')).to.be.not.null
        
        try {
            words.get('passais')
            
            expect('failure').to.be.null
        }
        catch(e) {}
        
        expect(words.get('passer@nom')).to.be.not.null
        expect(words.get('passer@past1')).to.be.not.null
        expect(words.get('passer@past2')).to.be.not.null
    })

    it('converts unstudied to JSON and back', function () {
        let after = Words.fromJson(words.toJson(), inflections);
        
        expect(after.wordsById[w3.getId()]).to.be.instanceOf(InflectedWord)

        expect(after.get('passer')).to.be.not.null
        
        try {
            after.get('passais')
            
            expect('failure').to.be.null
        }
        catch(e) {}
        
        expect(after.get('passer@nom')).to.be.not.null
        expect(after.get('passer@past1')).to.be.not.null
        expect(after.get('passer@past2')).to.be.not.null
    })
})