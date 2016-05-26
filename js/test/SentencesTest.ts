/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/Inflections'
import Inflection from '../shared/Inflection'
import InflectedWord from '../shared/InflectedWord'
import Sentence from '../shared/Sentence'
import Sentences from '../shared/Sentences'
import Ending from '../shared/Ending'
import Words from '../shared/Words'
import Word from '../shared/Word'
import Facts from '../shared/Facts'
import { parseEndings } from '../shared/InflectionFileParser'

import { expect } from 'chai';

describe('Sentences', function() {
    it('deletes', function() {        
        let io = new Word('io')
                
        let words = new Words().add(io)
        
        let sentences = new Sentences()
        
        sentences.add(new Sentence([ io ], null))
        
        let deleted = new Sentence([ io ], null)
        
        sentences.add(deleted)
        sentences.remove(deleted)
        
        sentences.add(new Sentence([ io ], null))

        expect(sentences.sentences.length).to.equal(2);
        expect(sentences.sentences[1].id).to.equal(2);
    })

    it('change change id', function() {        
        let io = new Word('io')
                
        let words = new Words().add(io)
        
        let sentences = new Sentences()
        
        let sentence = new Sentence([ io ], null)
        
        sentences.add(sentence)
        
        const NEW_ID = 17
        const OLD_ID = 0 
        
        expect(sentence.id).to.equal(OLD_ID)
        
        sentences.changeId(OLD_ID, NEW_ID)

        expect(sentences.sentences[0].id).to.equal(NEW_ID)

        sentence.id = OLD_ID
        sentence.words = [ io, io ]

        sentences.store(sentence)

        expect(sentences.sentences[0].id).to.equal(NEW_ID)
        expect(sentences.sentences.length).to.equal(1)
    })

    it('handles JSON conversion', function () {
        
        let inflection = new Inflection('verb', 'inf', null, 
            parseEndings('inf: re, i: vo', 'fake').endings)
        
        let io = new Word('io')
        let bere = new InflectedWord('bere', null, 'inf').setInflection(inflection)
        let bevo = new InflectedWord('bevo', bere, 'i').setInflection(inflection)
        
        let facts = new Facts()
        facts.add(io)
        facts.add(bere)
        
        let words = new Words().add(bere).add(io)
        
        let before = new Sentences()
        
        before.add(new Sentence(
            [ io, bevo ], 1
        ))
        
        let after = Sentences.fromJson(before.toJson(), facts, words)

        expect(after.sentences[0].words[0].getId()).to.equal(io.getId());
        expect(after.sentences[0].words[1].getId()).to.equal(bevo.getId());
        expect(after.sentences[0].words[1].toString()).to.equal('bevo');

    })
})