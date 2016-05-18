/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflection from '../shared/Inflection';
import Inflections from '../shared/Inflections';
import Word from '../shared/Word';
import Words from '../shared/Words';
import UnstudiedWord from '../shared/UnstudiedWord';
import InflectedWord from '../shared/InflectedWord';

import { expect } from 'chai';

let inflections = new Inflections([
    new Inflection('infl', 'nom', null, { nom: 'er', past1: 'ais', past2: 'ais' })
])

describe('Words', function() {
    let w1, w2: Word, w3: InflectedWord, words: Words;
    
    beforeEach(() => {        
        w1 = new UnstudiedWord('foo', 'bar').setEnglish('eng')
        w2 = new Word('fooo', 'bar').setEnglish('eng')
        w3 = new InflectedWord('passer', null, 'nom')
            .setEnglish('eng')
            .setInflection(inflections.inflections[0])

        words = new Words().add(w1).add(w2).add(w3)
    })

    it('handles changing inflections', function() {
        let oldPast = words.get('passer@past1')
        
        let newInflection = new Inflection(
            'infl', 'nom', null, { nom: 'sser', past1: 'ttais', past2: 'ttais' })
        
        words.changeInflection(w3, newInflection)
        
        expect(w3.stem).to.equal('pa')
        expect(w3.inflection).to.equal(newInflection)
        expect(w3.jp).to.equal('passer')
        
        expect(words.get('passer')).to.equal(w3)
        expect(words.get('passais')).to.be.undefined
        expect(oldPast.jp).to.equal('pattais')
        expect(words.get('passer@past1')).to.equal(oldPast)
        expect(words.get('passer@nom')).to.equal(w3)
    })

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