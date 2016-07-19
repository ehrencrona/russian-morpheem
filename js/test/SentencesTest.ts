/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Inflections from '../shared/inflection/Inflections'
import Inflection from '../shared/inflection/Inflection'
import InflectedWord from '../shared/InflectedWord'
import InflectableWord from '../shared/InflectableWord'
import Sentence from '../shared/Sentence'
import Sentences from '../shared/Sentences'
import Ending from '../shared/Ending'
import Words from '../shared/Words'
import Word from '../shared/Word'
import Facts from '../shared/fact/Facts'
import Phrase from '../shared/phrase/Phrase'
import Phrases from '../shared/phrase/Phrases'
import { parseEndings } from '../shared/inflection/InflectionsFileParser'

import { expect } from 'chai';

describe('Sentences', function() {
    it('deletes', function() {        
        let io = new Word('io')
                
        let words = new Words().addWord(io)
        
        let sentences = new Sentences()
        
        sentences.add(new Sentence([ io ], null))
        
        let deleted = new Sentence([ io ], null)
        
        sentences.add(deleted)
        sentences.remove(deleted)
        
        sentences.add(new Sentence([ io ], null))

        expect(sentences.sentences.length).to.equal(2);
        expect(sentences.sentences[1].id).to.equal(2);
    })

    it('handles JSON conversion', function () {
        
        let inflection = new Inflection('verb', 'inf', null, 
            parseEndings('inf: re, i: vo', 'fake').endings)

        let io = new Word('io')

        let drink = new InflectableWord('be', inflection)
        
        let bere = drink.inflect('inf')
        let bevo = drink.inflect('i')
        
        let words = new Words().addInflectableWord(drink).addWord(io)
        
        let phrases = new Phrases()
        let phrase = new Phrase('testPhrase', [])
        phrases.add(phrase)

        let before = new Sentences()
        
        before.add(new Sentence(
            [ io, bevo ], 1
        ).addPhrase(phrase))
        
        let after = new Sentences().fromJson(before.toJson(), phrases, words)

        expect(after.sentences[0].words[0].getId()).to.equal(io.getId());
        expect(after.sentences[0].words[1].getId()).to.equal(bevo.getId());
        expect(after.sentences[0].words[1].toString()).to.equal('bevo');
        expect(after.sentences[0].phrases[0].getId()).to.equal('testPhrase');

    })
})