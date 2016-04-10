/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import indexSentencesByFact from '../js/shared/IndexSentencesByFact'

import Inflections from '../js/shared/Inflections'
import Inflection from '../js/shared/Inflection'
import InflectedWord from '../js/shared/InflectedWord'
import Sentence from '../js/shared/Sentence'
import Sentences from '../js/shared/Sentences'
import Words from '../js/shared/Words'
import Word from '../js/shared/Word'
import Facts from '../js/shared/Facts'

import { expect } from 'chai';

describe('IndexSentencesByFact', function() {
    it('works', function () {
        
        let inflection = new Inflection('verb', 'inf', { inf: 're', i: 'vo' })
        
        let io = new Word('io')
        let bere = new InflectedWord('bere', 'be', null, 'inf').setInflection(inflection)
        let bevo = new InflectedWord('bevo', 'be', bere, 'i').setInflection(inflection)
        
        let facts = new Facts()
        facts.add(io)
        facts.add(inflection.getFact('inf'))
        facts.add(bere)
        facts.add(inflection.getFact('i'))
        
        let words = new Words().add(bere).add(io)
        
        let sentences = new Sentences()
        sentences.add(new Sentence([ io, bevo ], '1'))
        sentences.add(new Sentence([ bere ], '2'))

        let index = indexSentencesByFact(sentences, facts, 0)

        expect(index[ io.getId() ].easy).to.equal(0)
        expect(index[ io.getId() ].hard).to.equal(1)
        
        expect(index[ bere.getId() ].easy).to.equal(1)
        expect(index[ bere.getId() ].hard).to.equal(1)
        
        expect(index[ inflection.getFact('inf').getId() ].hard).to.equal(1)
        expect(index[ inflection.getFact('inf').getId() ].easy).to.equal(0)

        index = indexSentencesByFact(sentences, facts, 1)

        expect(index[ bere.getId() ].ok).to.equal(1)

    })
})