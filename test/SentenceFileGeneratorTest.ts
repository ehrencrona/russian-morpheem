"use strict";

import parser from '../js/shared/SentenceFileParser'
import { sentenceToString } from '../js/shared/SentenceFileGenerator'

import { expect } from 'chai';

import Word from '../js/shared/Word'
import Words from '../js/shared/Words'
import InflectedWord from '../js/shared/InflectedWord'
import Inflection from '../js/shared/Inflection'
import Inflections from '../js/shared/Inflections'
import Sentences from '../js/shared/Sentences'
import Facts from '../js/shared/Facts'
import Grammar from '../js/shared/Grammar'

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

    it('doesn\'t unnecessarily add forms', function () {
        let inflections = new Inflections([            
            new Inflection('fem', 'nom', null, { nom: 'a', acc: 'y' }),
            new Inflection('masc', 'nom', null, { nom: '', acc: '' })
        ])
        
        let words = new Words();
        
        words.add(new InflectedWord('sobaka', 'sobak', null, 'nom').setInflection(inflections.get('fem')))
        words.add(new InflectedWord('dom', 'dom', null, 'nom').setInflection(inflections.get('masc')))

        var sentences: Sentences = parser('sobaka@acc sobaka@nom dom@acc dom@nom: bla', words, new Facts())

        let generated = sentenceToString(sentences.sentences[0], words)

        expect(generated).to.equal('sobaky sobaka dom@acc dom@nom: bla')
    })
})
