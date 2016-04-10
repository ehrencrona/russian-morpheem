"use strict";

import parser from '../js/shared/SentenceFileParser'

import { expect } from 'chai';

import Word from '../js/shared/Word'
import Words from '../js/shared/Words'
import Facts from '../js/shared/Facts'
import Grammar from '../js/shared/Grammar'

describe('SentenceFileParser', function() {
    it('parses words and meaning', function () {
        var a = new Word('a')

        let words = new Words();
        words.add(a)
        words.add(new Word('b'))

        var sentences = parser('a b: english',  words, new Facts())
        let sentence = sentences.sentences[0]

        expect(sentence.words.length).to.equal(2)
        expect(sentence.words[0]).to.equal(a)
        expect(sentence.english).to.equal('english')
    })

    it('handles requires', function () {
        var a = new Word('a')
        let words = new Words();
        words.add(a)

        let facts = new Facts()
        facts.add(new Grammar('grammar'))

        var sentences = parser('a (requires: grammar): english', words, facts)
        let sentence = sentences.sentences[0]

        expect(sentence.words[0]).to.equal(a)
        expect(sentence.required[0].getId()).to.equal('grammar')
    })
})
