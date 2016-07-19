"use strict";

import parser from '../shared/SentenceFileParser'

import { expect } from 'chai';

import Word from '../shared/Word'
import Words from '../shared/Words'
import Facts from '../shared/fact/Facts'
import Phrases from '../shared/phrase/Phrases'
import Phrase from '../shared/phrase/Phrase'
import Grammar from '../shared/Grammar'

describe('SentenceFileParser', function() {
    it('parses words and meaning', function () {
        var a = new Word('a')

        let words = new Words();
        words.addWord(a)
        words.addWord(new Word('b', '1'))
        words.addWord(new Word('b', '2'))

        var sentences = parser('9 a b[1] b[2]: english',  words, new Phrases())
        let sentence = sentences.sentences[0]

        expect(sentence.words.length).to.equal(3)
        expect(sentence.words[0]).to.equal(a)
        expect(sentence.words[1].classifier).to.equal('1')
        expect(sentence.english).to.equal('english')
        expect(sentence.id).to.equal(9)
    })

    it('handles phrases', function () {
        var a = new Word('a')
        let words = new Words();
        words.addWord(a)

        let phrases = new Phrases()
        phrases.add(new Phrase('testPhrase', []))

        var sentences = parser('123 a (author: ae, phrase: testPhrase): english', words, phrases)
        let sentence = sentences.sentences[0]

        expect(sentence.author).to.equal('ae')
        expect(sentence.words[0]).to.equal(a)
        expect(sentence.phrases[0].getId()).to.equal('testPhrase')
        expect(sentence.id).to.equal(123)
    })
})
