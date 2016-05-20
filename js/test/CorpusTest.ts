/// <reference path="./mocha.d.ts" />
/// <reference path="./chai.d.ts" />

import Corpus from '../shared/Corpus';
import readCorpus from '../backend/CorpusReader';

import { expect } from 'chai';

describe('Corpus', function() {

    it('converts to and from JSON', (done) => {   
        readCorpus().then((corpus) => {
            console.log(corpus.toJson())
            
            let after = Corpus.fromJson(corpus.toJson())

            expect(after.facts.facts.length).to.be.greaterThan(0)
            expect(after.facts.facts.length).to.equal(corpus.facts.facts.length)
            expect(after.sentences.sentences.length).to.be.greaterThan(0)
            expect(after.sentences.sentences.length).to.equal(corpus.sentences.sentences.length)

            done()
        })
        .catch((e) => {
            done(e)
        })
    })

})