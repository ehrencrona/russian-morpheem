/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../js/shared/Inflections'
import Inflection from '../js/shared/Inflection'
import InflectedWord from '../js/shared/InflectedWord'
import Sentence from '../js/shared/Sentence'
import Sentences from '../js/shared/Sentences'
import Words from '../js/shared/Words'
import Word from '../js/shared/Word'
import Facts from '../js/shared/Facts'

import { expect } from 'chai';

describe('Sentences', function() {
    it('handles JSON conversion', function () {
        
        let inflection = new Inflection('verb', 'inf', null, { inf: 're', i: 'vo' })
        
        let io = new Word('io')
        let bere = new InflectedWord('bere', 'be', null, 'inf').setInflection(inflection)
        let bevo = new InflectedWord('bevo', 'be', bere, 'i').setInflection(inflection)
        
        let facts = new Facts()
        facts.add(io)
        facts.add(bere)
        
        let words = new Words().add(bere).add(io)
        
        let before = new Sentences()
        
        before.add(new Sentence(
            [ io, bevo ], '1'
        ))
        
        let after = Sentences.fromJson(before.toJson(), facts, words)

        expect(after.sentences[0].words[0].getId()).to.equal(io.getId());
        expect(after.sentences[0].words[1].getId()).to.equal(bevo.getId());
        expect(after.sentences[0].words[1].toString()).to.equal('bevo');

    })
})