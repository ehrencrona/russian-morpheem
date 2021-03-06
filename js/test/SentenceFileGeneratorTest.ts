'use strict';

import parser from '../shared/SentenceFileParser'
import { sentenceToString } from '../shared/SentenceFileGenerator'

import { expect } from 'chai';

import Word from '../shared/Word'
import Words from '../shared/Words'
import InflectableWord from '../shared/InflectableWord'
import Inflection from '../shared/inflection/Inflection'
import Inflections from '../shared/inflection/Inflections'
import WORD_FORMS from '../shared/inflection/WordForms'
import Sentences from '../shared/Sentences'
import Ending from '../shared/Ending'
import Facts from '../shared/fact/Facts'
import Phrases from '../shared/phrase/Phrases'
import Phrase from '../shared/phrase/Phrase'
import AbstractFact from '../shared/fact/AbstractFact'
import { parseEndings } from '../shared/inflection/InflectionsFileParser'
import Corpus from '../shared/Corpus'

describe('SentenceFileGenerator', function() {
    let phrases = new Phrases()
    phrases.setCorpus(Corpus.createEmpty('ru'))
    phrases.add(new Phrase('testPhrase', []))

    it('generates same string as the read one', function () {
        var a = new Word('a')

        let words = new Words()
        
        words.addWord(a)
        words.addWord(new Word('b', '1'))
        words.addWord(new Word('b', '2'))
        words.addWord(new Word(':'))

        let facts = new Facts()
        facts.add(new AbstractFact('grammar'))

        let original = '0 a b[1] [colon] b[2] (author: ae, phrase: testPhrase): english'

        var sentences: Sentences = parser(original, words, phrases)

        let generated = sentenceToString(sentences.sentences[0], words)

        expect(generated).to.equal(original)
    })

    it('adds forms', function () {
        let inflections = new Inflections([            
            new Inflection('fem', 'nom', null,
                parseEndings('nom: a, acc: y', WORD_FORMS['pron']).endings),
            new Inflection('masc', 'nom', null, 
                parseEndings('nom: , acc: ', WORD_FORMS['pron']).endings) ])
        
        let words = new Words();

        words.addInflectableWord(new InflectableWord('sobak', inflections.get('fem')))
        words.addInflectableWord(new InflectableWord('dom', inflections.get('masc')))

        var sentences: Sentences = parser('sobaka@acc sobaka@nom dom@acc dom@nom: bla', words, phrases)
    })
})
