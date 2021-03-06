import { WORD_FORMS } from '../shared/inflection/WordForms';
/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import { findSentencesForFact, indexSentencesByFact } from '../shared/SentencesByFactIndex'

import Inflections from '../shared/inflection/Inflections'
import Inflection from '../shared/inflection/Inflection'
import InflectedWord from '../shared/InflectedWord'
import InflectableWord from '../shared/InflectableWord'

import readCorpus from '../backend/CorpusReader';
import Sentence from '../shared/Sentence'
import Sentences from '../shared/Sentences'
import Words from '../shared/Words'
import Word from '../shared/Word'
import Facts from '../shared/fact/Facts'
import Ending from '../shared/Ending'

import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import { expect } from 'chai';

describe('SentencesByFactIndex', function() {
    let inflection = new Inflection('verb', 'inf', null, 
        parseEndings('inf: re, i: vo', WORD_FORMS['pron']).endings)

    let io = new Word('io')
    
    let inf = new InflectableWord('be', inflection)
    
    let bere = inf.inflect('inf')
    let bevo = inf.inflect('i')
    
    let facts = new Facts()
    facts.add(io)
    facts.add(inflection.getFact('inf'))
    facts.add(inf)
    facts.add(inflection.getFact('i'))
    
    let words = new Words().addInflectableWord(inf).addWord(io)
    
    let sentences = new Sentences()
    sentences.add(new Sentence([ io, bevo ], 1))
    sentences.add(new Sentence([ bere ], 2))

    it('finds sentences by fact', function () {
        let fs = findSentencesForFact(inf, sentences, facts, 0)

        expect(fs.easy.length).to.equal(1)
        expect(fs.hard.length).to.equal(1)

        fs = findSentencesForFact(inf, sentences, facts, 1)

        expect(fs.easy.length).to.equal(1)
        expect(fs.ok.length).to.equal(1)
    })

    it('indexes all sentences by fact', function () {
        let index = indexSentencesByFact(sentences, facts, 0)

        expect(index[ io.getId() ].easy.length).to.equal(0)
        expect(index[ io.getId() ].hard.length).to.equal(1)
        
        expect(index[ inf.getId() ].easy.length).to.equal(1)
        expect(index[ inf.getId() ].hard.length).to.equal(1)
        
        expect(index[ inflection.getFact('inf').getId() ].hard.length).to.equal(1)
        expect(index[ inflection.getFact('inf').getId() ].easy.length).to.equal(0)

        index = indexSentencesByFact(sentences, facts, 1)

        expect(index[ inf.getId() ].ok.length).to.equal(1)
    })

    it('works on real data', function (done) {
        readCorpus('ru', false).then((corpus) => {
            indexSentencesByFact(corpus.sentences, corpus.facts)
            
            done()
        })
        .catch((e) => {
            done(e)
        })        
    })
})