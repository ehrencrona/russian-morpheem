"use strict";

import parser from '../shared/SentenceFileParser'

import { expect } from 'chai';

import Word from '../shared/Word'
import Words from '../shared/Words'
import Facts from '../shared/Facts'
import Grammar from '../shared/Grammar'

describe('SentenceFileParser', function() {
    it('parses words and meaning', function () {
        var a = new Word('a')

        let words = new Words();
        words.add(a)
        words.add(new Word('b', '1'))
        words.add(new Word('b', '2'))

        var sentences = parser('a b[1] b[2]: english',  words, new Facts())
        let sentence = sentences.sentences[0]

        expect(sentence.words.length).to.equal(3)
        expect(sentence.words[0]).to.equal(a)
        expect(sentence.words[1].classifier).to.equal('1')
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
