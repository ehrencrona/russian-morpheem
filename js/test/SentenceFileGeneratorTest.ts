"use strict";

import parser from '../shared/SentenceFileParser'
import { sentenceToString } from '../shared/SentenceFileGenerator'

import { expect } from 'chai';

import Word from '../shared/Word'
import Words from '../shared/Words'
import InflectedWord from '../shared/InflectedWord'
import Inflection from '../shared/Inflection'
import Inflections from '../shared/Inflections'
import Sentences from '../shared/Sentences'
import Facts from '../shared/Facts'
import Grammar from '../shared/Grammar'

describe('SentenceFileGenerator', function() {
    it('generates same string as the read one', function () {
        var a = new Word('a')

        let words = new Words()
        
        words.add(a)
        words.add(new Word('b', '1'))
        words.add(new Word('b', '2'))

        let original = 'a b[1] b[2]: english'

        var sentences: Sentences = parser(original, words, new Facts())

        let generated = sentenceToString(sentences.sentences[0], words)

        expect(generated).to.equal(original)
    })

    it('adds forms', function () {
        let inflections = new Inflections([            
            new Inflection('fem', 'nom', null, { nom: 'a', acc: 'y' }),
            new Inflection('masc', 'nom', null, { nom: '', acc: '' })
        ])
        
        let words = new Words();

        words.add(new InflectedWord('sobaka', null, 'nom').setInflection(inflections.get('fem')))
        words.add(new InflectedWord('dom', null, 'nom').setInflection(inflections.get('masc')))

        var sentences: Sentences = parser('sobaka@acc sobaka@nom dom@acc dom@nom: bla', words, new Facts())
    })
})
