'use strict';

import parser from '../shared/SentenceFileParser'
import { sentenceToString } from '../shared/SentenceFileGenerator'

import { expect } from 'chai';

import Word from '../shared/Word'
import Words from '../shared/Words'
import InflectableWord from '../shared/InflectableWord'
import Inflection from '../shared/Inflection'
import Inflections from '../shared/Inflections'
import Sentences from '../shared/Sentences'
import Ending from '../shared/Ending'
import Facts from '../shared/Facts'
import Grammar from '../shared/Grammar'
import { parseEndings } from '../shared/InflectionsFileParser'

describe('SentenceFileGenerator', function() {
    it('generates same string as the read one', function () {
        var a = new Word('a')

        let words = new Words()
        
        words.addWord(a)
        words.addWord(new Word('b', '1'))
        words.addWord(new Word('b', '2'))

        let facts = new Facts()
        facts.add(new Grammar('grammar'))

        let original = 'a b[1] b[2] (author: ae, requires: grammar): english'

        var sentences: Sentences = parser(original, words, facts)

        let generated = sentenceToString(sentences.sentences[0], words)

        expect(generated).to.equal(original)
    })

    it('adds forms', function () {
        let inflections = new Inflections([            
            new Inflection('fem', 'nom', null,
                parseEndings('nom: a, acc: y', 'fake').endings),
            new Inflection('masc', 'nom', null, 
                parseEndings('nom: , acc: ', 'fake').endings) ])
        
        let words = new Words();

        words.addInflectableWord(new InflectableWord('sobak', inflections.get('fem')))
        words.addInflectableWord(new InflectableWord('dom', inflections.get('masc')))

        var sentences: Sentences = parser('sobaka@acc sobaka@nom dom@acc dom@nom: bla', words, new Facts())
    })
})
